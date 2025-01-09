package torrent

import (
	"bytes"
	"errors"
	"io"
	"net"
	"time"
)

func ConnectToPeer(peer string, infoHash [20]byte, peerID string) (net.Conn, error) {
	conn, err := net.DialTimeout("tcp", peer, 5*time.Second)
	if err != nil {
		return nil, err
	}

	// Handshake:
	// <pstrlen><pstr><reserved><info_hash><peer_id>
	pstr := "BitTorrent protocol"
	pstrlen := byte(len(pstr))
	reserved := make([]byte, 8) // все нули
	buf := bytes.NewBuffer(nil)
	buf.WriteByte(pstrlen)
	buf.WriteString(pstr)
	buf.Write(reserved)
	buf.Write(infoHash[:])
	buf.Write([]byte(peerID))

	conn.SetWriteDeadline(time.Now().Add(5 * time.Second))
	_, err = conn.Write(buf.Bytes())
	if err != nil {
		conn.Close()
		return nil, err
	}

	// Читаем ответ
	resp := make([]byte, 68)
	conn.SetReadDeadline(time.Now().Add(10 * time.Second))
	_, err = io.ReadFull(conn, resp)
	if err != nil {
		conn.Close()
		return nil, err
	}

	// Проверяем ответ
	if resp[0] != pstrlen || string(resp[1:1+len(pstr)]) != pstr {
		conn.Close()
		return nil, errors.New("invalid handshake response")
	}

	// Проверяем infoHash
	if !bytes.Equal(resp[28:48], infoHash[:]) {
		conn.Close()
		return nil, errors.New("info hash mismatch")
	}

	return conn, nil
}
