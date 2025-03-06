package main

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"mime"
	"os"
	"os/exec"
	"strconv"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type ImageStore struct {
	ResourceBaseUrl string
	store           *s3.Client
	bucketName      string
}

// An image represents a collection of store objects represented by a name, height and mimeType (extension)

// We're using the height as the identifier as resolutions (eg HD and FHD) are represented by the pixel height in their naming convention.
// An image that has a downscaled HD and FHD would have AvailableHeights equal to {720, 1080}
//
// The original image is represented using the number 0
type Image struct {
	MimeType string
	Name     string
	Data     []byte
	AvailableHeights ImageHeights
}

type Height int
type ImageHeights []Height

func initializeImageStore() (*ImageStore, error) {
	r2StoreUrl := os.Getenv("R2_STORE_URL")
	r2AccountId := os.Getenv("R2_ACCOUNT_ID")
	r2AccessKey := os.Getenv("R2_ACCESS_KEY")
	r2SecretKey := os.Getenv("R2_ACCESS_SECRET_KEY")
	r2BucketName := os.Getenv("R2_BUCKET")

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(r2AccessKey, r2SecretKey, "")),
		config.WithRegion("apac"),
	)
	if err != nil {
		return nil, err
	}

	client := s3.NewFromConfig(cfg, func(opts *s3.Options) {
		opts.BaseEndpoint = aws.String(fmt.Sprintf(r2StoreUrl, r2AccountId))
	})

	return &ImageStore{
		store:           client,
		bucketName:      r2BucketName,
		ResourceBaseUrl: os.Getenv("R2_EXTERNAL_URL"),
	}, nil
}

func NewImage(b64Image string, heights ImageHeights) (*Image, error) {
	parts := strings.Split(b64Image, ",")
	img, err := base64.StdEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, err
	}

	dirtyImgType := strings.Replace(parts[0], "data:", "", 1)
	imgType := strings.Replace(dirtyImgType, ";base64", "", 1)

	if len(heights) == 0 {
		heights = append(heights, 0, 320)
	}

	return &Image{
		MimeType: imgType,
		Data:     img,
		AvailableHeights: heights,
	}, nil
}

func (s *ImageStore) Store(img *Image) (string, error) {
	images := make(map[string][]byte)

	err := img.saveToDisk()
	if err != nil {
		return "", err
	}

	for _, height := range img.AvailableHeights {
		var imgName string
		var imgBytes []byte

		if height != 0 {
			downscaled, err := img.downscale(height)
			if err != nil {
				return "", err
			}

			imgBytes = downscaled
			imgName = img.GetFilenameWithPostfix(strconv.Itoa(int(height)))
		} else {
			imgName = img.GetFilename()
			imgBytes = img.Data
		}

		images[imgName] = imgBytes
	}

	err = img.removeInstances(img.AvailableHeights)
	if err != nil {
	}

	for name, image := range images {
		bodyReader := strings.NewReader(string(image))
		_, err := s.store.PutObject(context.TODO(), &s3.PutObjectInput{
			Bucket:      &s.bucketName,
			Key:         &name,
			ContentType: &img.MimeType,
			Body:        bodyReader,
		})
		if err != nil {
			return "", err
		}
	}

	imgUrl := s.ResourceBaseUrl + "/" + img.GetFilename()

	return imgUrl, nil
}

func (s *ImageStore) getAllImageNames(imgName string) ([]string, error) {
	out, err := s.store.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
		Bucket: &s.bucketName,
		Prefix: &imgName,
	})

	if err != nil {
		return []string{}, err
	}

	names := make([]string, 0, len(out.Contents))
	for i := range out.Contents {
		names = append(names, *out.Contents[i].Key)
	}

	return names, nil
}

func (s *ImageStore) Delete(imgUrl string) error {
	identifier := strings.TrimPrefix(imgUrl, s.ResourceBaseUrl+"/")
	identifierChunks := strings.Split(identifier, ".")
	names, err := s.getAllImageNames(identifierChunks[0])

	for _, name := range names {
		_, deleteErr := s.store.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
			Bucket: &s.bucketName,
			Key:    &name,
		})
		if deleteErr != nil {
			err = deleteErr
		}
	}

	return err
}

func (img *Image) GetFilename() string {
	exts, err := mime.ExtensionsByType(img.MimeType)
	if err != nil {
		return img.Name
	}

	return img.Name + exts[0]
}

func (img *Image) GetFilenameWithPostfix(namePostfix string) string {
	exts, err := mime.ExtensionsByType(img.MimeType)
	if err != nil {
		return img.Name
	}

	return img.Name + "-" + namePostfix + exts[0]
}

func (img *Image) GetNameSizeThumbnail() string {
	return strings.Replace(img.GetFilename(), ".", "-thumbnail.", 1)
}

func (img *Image) saveToDisk() error {
	err := os.WriteFile(img.GetFilename(), img.Data, 0600)
	if err != nil {
		return err
	}

	return nil
}

func (img *Image) removeInstances(heights ImageHeights) error {
	var err error
	for _, height := range heights {
		var filename string
		if height != 0 {
			filename = img.GetFilenameWithPostfix(strconv.Itoa(int(height)))
		} else {
			filename = img.GetFilename()
		}

		currErr := os.Remove(filename)

		if currErr != nil {
			err = currErr
		}
	}

	return err
}

func (img *Image) downscale(height Height) ([]byte, error) {
	if height == 0 {
		return nil, errors.New("Height cannot be zero")
	}

	f, err := os.OpenFile(img.GetFilename(), os.O_RDONLY, 0600)
	if err != nil {
		return nil, err
	}
	f.Close()

	cmd := exec.Command("ffmpeg", "-i", img.GetFilename(), "-vf", fmt.Sprintf("scale=%d:-1", height), img.GetFilenameWithPostfix(strconv.Itoa(int(height))))
	err = cmd.Run()
	if err != nil {
		return nil, err
	}

	thumbnail, err := os.ReadFile(img.GetFilenameWithPostfix(strconv.Itoa(int(height))))
	if err != nil {
		return nil, err
	}

	return thumbnail, nil
}
