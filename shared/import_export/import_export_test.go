package importexport

import (
	"cmp"
	"gurl/shared/db"
	"gurl/shared/models"
	"os"
	"path/filepath"
	"runtime"
	"slices"
	"testing"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

var testDb *gorm.DB

func TestMain(m *testing.M) {

	_, file, _, _ := runtime.Caller(0)

	baseDir := filepath.Dir(file)

	dsn := filepath.Join(baseDir, "exporter.db")

	os.Remove(dsn)

	d, err := db.InitDb(dsn)

	if err != nil {
		panic(err)
	}

	d.AutoMigrate(
		&db.Collection{},
		&db.Request{})

	testDb = d
	exitVal := m.Run()

	//cleanup
	os.Remove(dsn)
	os.Exit(exitVal)
}

func TestToExportedKeyValItem(t *testing.T) {

	tests := []struct {
		Name string
		Raw  string
		Want []models.ExportedKeyValItem
	}{
		{Name: "empty array case", Raw: `[]`, Want: []models.ExportedKeyValItem{}},
		{Name: "invalid json", Raw: `[{name:value}]`, Want: []models.ExportedKeyValItem{}},
		{Name: "valid json", Raw: `
		[
		  {
		   "key": "hello",
		   "val": "world",
		   "enabled": "on"
		  },
	      {
		   "key": "foo",
		   "val": "bar",
		   "enabled": "off"
		  }
		]
		`, Want: []models.ExportedKeyValItem{
			{K: "hello", V: "world"},
			{K: "foo", V: "bar"},
		}},
	}

	for _, test := range tests {

		t.Run(test.Name, func(t *testing.T) {

			got := toExportedKeyValItem(datatypes.JSON(test.Raw))

			if len(got) != len(test.Want) {
				t.Errorf("expected output %v got %v", test.Want, got)
			}

			if len(test.Want) > 0 {

				less := func(a, b models.ExportedKeyValItem) int {
					return cmp.Compare(a.K, b.K)
				}

				slices.SortFunc(test.Want, less)
				slices.SortFunc(got, less)

				if !slices.Equal(got, test.Want) {
					t.Errorf("expected output %v got %v", test.Want, got)
				}

			}
		})

	}

}

func TestToExportedMultipartItem(t *testing.T) {

	tests := []struct {
		Name string
		Raw  string
		Want []models.ExportedMultipartItem
	}{
		{Name: "empty array case", Raw: `[]`, Want: []models.ExportedMultipartItem{}},
		{Name: "invalid json", Raw: `[{name:value}]`, Want: []models.ExportedMultipartItem{}},
		{Name: "valid json", Raw: `
		[
		  {
		   "key": "hello",
		   "val": "world",
		   "enabled": "on"
		  },
	      {
		   "key": "file",
		   "val": {
		     "name": "file.txt",
			 "size": 100,
			 "path": "/path/to/file"
		   },
		   "enabled": "off"
		  }
		]
		`, Want: []models.ExportedMultipartItem{
			{K: "hello", V: "world", IsFile: false},
			{K: "file", V: "/path/to/file", IsFile: true},
		}},
	}

	for _, test := range tests {

		t.Run(test.Name, func(t *testing.T) {

			got := ToExportedMultipartItem(datatypes.JSON(test.Raw))

			if len(got) != len(test.Want) {
				t.Errorf("expected output %v got %v", test.Want, got)
			}

			if len(test.Want) > 0 {
				less := func(a, b models.ExportedMultipartItem) int {
					return cmp.Compare(a.K, b.K)
				}

				slices.SortFunc(test.Want, less)
				slices.SortFunc(got, less)

				if !slices.Equal(got, test.Want) {
					t.Errorf("expected output %v got %v", test.Want, got)
				}
			}
		})

	}

}

func TestToExportedReq(t *testing.T) {

	rawKeyValItem := `[
		  {
		   "key": "hello",
		   "val": "world",
		   "enabled": "on"
		  },
	      {
		   "key": "foo",
		   "val": "bar",
		   "enabled": "off"
		  }
		]`

	wantKeyVItems := []models.ExportedKeyValItem{
		{K: "hello", V: "world"},
		{K: "foo", V: "bar"},
	}

	rawBinaryB := `
  {
    "name": "file.txt",
	"path": "path/to/file",
	"size": 100
  }
	`
	wantBinaryB := models.FileStats{
		Path: "path/to/file",
	}

	rawMultipartItem := `
	 [
		  {
		   "key": "hello",
		   "val": "world",
		   "enabled": "on"
		  },
	      {
		   "key": "file",
		   "val": {
		     "name": "file.txt",
			 "size": 100,
			 "path": "/path/to/file"
		   },
		   "enabled": "off"
		  }
		]
	`
	wantMultipartItems := []models.ExportedMultipartItem{
		{K: "hello", V: "world", IsFile: false},
		{K: "file", V: "/path/to/file", IsFile: true},
	}

	req := db.Request{
		BaseEntity: db.BaseEntity{
			Id: "test-export",
		},
		Name: "test-export-req",
		RequestCore: db.RequestCore{
			Url: "test-url",

			Method:         "GET",
			Query:          datatypes.JSON(rawKeyValItem),
			Headers:        datatypes.JSON(rawKeyValItem),
			Cookies:        datatypes.JSON(rawKeyValItem),
			TextBody:       "hello world",
			UrlEncodedForm: datatypes.JSON(rawKeyValItem),
			BinaryBody:     datatypes.JSON(rawBinaryB),
			MultipartForm:  datatypes.JSON(rawMultipartItem),
			BodyType:       "none",
			AuthEnabled:    false,
			AuthType:       "no_auth",
		},
	}

	gotReq := toExportedRequest(req)

	if gotReq.Url != req.Url {
		t.Errorf("expected url %s , got %s", req.Url, gotReq.Url)
	}

	if gotReq.Method != req.Method {
		t.Errorf("expected method %s , got %s", req.Method, gotReq.Method)
	}

	if gotReq.Name != req.Name {
		t.Errorf("expected name %s , got %s", req.Name, gotReq.Name)
	}

	kvCmp := func(a, b models.ExportedKeyValItem) int {
		return cmp.Compare(a.K, b.K)
	}

	multipartCmp := func(a, b models.ExportedMultipartItem) int {
		return cmp.Compare(a.K, b.K)
	}

	slices.SortFunc(wantKeyVItems, kvCmp)
	slices.SortFunc(wantMultipartItems, multipartCmp)

	slices.SortFunc(gotReq.QueryParams, kvCmp)

	if !slices.Equal(gotReq.QueryParams, wantKeyVItems) {
		t.Errorf("expected query %v, got %v", wantKeyVItems, gotReq.QueryParams)
	}

	slices.SortFunc(gotReq.Headers, kvCmp)

	if !slices.Equal(gotReq.Headers, wantKeyVItems) {
		t.Errorf("expected headers %v, got %v", wantKeyVItems, gotReq.Headers)
	}

	slices.SortFunc(gotReq.Cookies, kvCmp)

	if !slices.Equal(gotReq.Cookies, wantKeyVItems) {
		t.Errorf("expected cookies %v, got %v", wantKeyVItems, gotReq.Cookies)
	}

	slices.SortFunc(gotReq.UrlEncodedBody, kvCmp)

	if !slices.Equal(gotReq.UrlEncodedBody, wantKeyVItems) {
		t.Errorf("expected urlencoded %v, got %v", wantKeyVItems, gotReq.UrlEncodedBody)
	}

	slices.SortFunc(gotReq.MultipartBody, multipartCmp)

	if !slices.Equal(gotReq.MultipartBody, wantMultipartItems) {
		t.Errorf("expected multipart %v, got %v", wantKeyVItems, gotReq.MultipartBody)
	}

	if gotReq.BinaryBody != wantBinaryB.Path {
		t.Errorf("expected binary path %s, got %s", wantBinaryB.Path, gotReq.BinaryBody)
	}

	if gotReq.TextBody != req.TextBody {
		t.Errorf("expected text body %s, got %s", req.TextBody, gotReq.TextBody)
	}

	if string(gotReq.BodyType) != req.BodyType {
		t.Errorf("expected body type %s, got %s", req.BodyType, string(gotReq.BodyType))
	}

	if string(gotReq.AuthType) != req.AuthType {
		t.Errorf("expected auth type %s, got %s", req.AuthType, string(gotReq.AuthType))
	}

}
