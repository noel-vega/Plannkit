#!/bin/bash
migrate -database "postgres://plannkit:plannkit@localhost:5432/plannkit?sslmode=disable" -path migrations up
