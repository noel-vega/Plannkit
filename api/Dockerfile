FROM golang:1.25

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -v -o /usr/local/bin/app

ARG POSTGRES_CONNECTION_STRING
ENV POSTGRES_CONNECTION_STRING=${POSTGRES_CONNECTION_STRING}

CMD ["app"] 
