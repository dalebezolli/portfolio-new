package main

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
)

func GetStructure(elem any) error {
	elementType := reflect.TypeOf(elem)
	// This identifies if it's parsable from visible fields
	if elementType.Kind() != reflect.Struct {
		return errors.New(fmt.Sprintf("Cannot reflect on non-struct element of type %v", elementType.Elem().Name()))
	}
	// TODO: If it isn't we can check if it's an array slice or pointer and .Elem it to get the underlying data.

	fields := reflect.VisibleFields(elementType)
	for _, f := range fields {
		structOrArr := ""
		if f.Type.Kind() == reflect.Struct {
			structOrArr = "struct"
		}

		if f.Type.Kind() == reflect.Slice {
			structOrArr = "slice"
		}

		fmt.Printf("\t%v : %v %v\n", f.Name, f.Type, structOrArr)
	}

	return nil
}

func StringToPath(str string) string {
	return strings.ReplaceAll(strings.ToLower(str), " ", "_")
}
