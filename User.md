## User
Page description

### User Create

```
POST /users
```

```json
{
  "username": "smith",
  "email": "john.smith@example.com"
}
```

#### Curl Example
```bash
$ curl --request POST https://api.example.com/users \
--header 'Accept: application/json' \
--data '{
  "username": "smith",
  "email": "john.smith@example.com"
}'
```

#### Response Example
```
HTTP/1.1 201
```

```json
{
  "id": "111848702235277",
  "username": "smith",
  "email": "john.smith@example.com",
  "created_at": "2012-01-01T12:00:00Z",
  "updated_at": "2012-01-01T12:00:00Z"
}
```
### User Read

```
GET /users/__$create.response.body.id__
```


#### Curl Example
```bash
$ curl https://api.example.com/users/__$create.response.body.id__ \
--header 'Accept: application/json'
```

#### Response Example
```
HTTP/1.1 200
```

```json
{
  "id": "111848702235277",
  "username": "smith",
  "email": "john.smith@example.com",
  "created_at": "2012-01-01T12:00:00Z",
  "updated_at": "2012-01-01T12:00:00Z"
}
```

