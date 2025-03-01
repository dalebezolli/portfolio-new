package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"mime"
	"os"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type ImageStore struct{
	store *s3.Client
	bucketName string
}

type Image struct {
	MimeType string
	Name   string
	Data   []byte
}

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
		store: client,
		bucketName: r2BucketName,
	}, nil
}

func (s *ImageStore) Store(img *Image) (string, error) {
	name := img.GetName()
	bodyReader := strings.NewReader(string(img.Data))

	_, err := s.store.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: &s.bucketName,
		Key: &name,
		ContentType: &img.MimeType,
		Body: bodyReader,
	})
	if err != nil {
		return "", err
	}


	imgUrl := os.Getenv("R2_EXTERNAL_URL") + "/" + img.GetName()

	return imgUrl, nil
}

func (img *Image) GetName() string {
	exts, err := mime.ExtensionsByType(img.MimeType)
	if err != nil {
		return img.Name
	}

	return img.Name + exts[0]
}

func ConvertB64ImgToImage(encoded string) (*Image, error) {
	parts := strings.Split(encoded, ",")
	img, err := base64.StdEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, err
	}

	dirtyImgType := strings.Replace(parts[0], "data:", "", 1)
	imgType := strings.Replace(dirtyImgType, ";base64", "", 1)

	return &Image{
		MimeType: imgType,
		Data:   img,
	}, nil
}
