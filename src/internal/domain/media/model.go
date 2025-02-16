package media

import (
	"encoding/json"
	"time"
)

type Media struct {
	Filename   string    `json:"filename,omitempty"`
	UploadDate time.Time `json:"upload_date,omitempty"`
	Url        string    `json:"s_url,omitempty"`
	FullUrl    string    `json:"url,omitempty"`
	Type       string    `json:"type,omitempty"`
	ImageData  string    `json:"image_data,omitempty"`
}

func (m *Media) MarshalJSON() ([]byte, error) {
	type Alias Media
	minskLocation, _ := time.LoadLocation("Europe/Minsk")
	return json.Marshal(&struct {
		Date string `json:"upload_date,omitempty"`
		*Alias
	}{
		Date:  m.UploadDate.In(minskLocation).Format("2006-01-02 15:04:05"),
		Alias: (*Alias)(m),
	})
}
