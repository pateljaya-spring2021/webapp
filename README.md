# REST API using Node.js, Express, Sequelize and MySQL


## Getting Started
1. If you do not have node.js installed use below nodejs link to install it on your PC

    [Nodejs](https://nodejs.org/en/)

2. Clone the repository
```
    git clone git@github.com:jayashree1992/webapp.git
```

3. run command for npm 
```
npm install
```

4. Update configuration in config.js

5. migrate data to database using below command
```
sequelize db:migrate
```
6. Start the server
```
npm start
```
7. I Use Postman Client to use my REST Web Services , you are allowed to use any API Clients for this Purpose If you Have not Installed Postman on your device Please use the below URL For downloading it

[POSTMAN](https://www.postman.com/downloads/)



## Testing Endpoints

### Authenticated

1. For Retrieving User Info  
(http request type - GET)

```
http://localhost:3005/v1/uer/self
```

2. For Updating User Info  
(http request type - PUT)

```
http://localhost:3005/v1/user/self
```

```
Sample Request Body
{
  "first_name": "Jane",
  "last_name": "Doe",
  "password": "skdjfhskdfjhg"
}
```

3. For creating/posting new book  
(http request type - POST)

```
http://localhost:3005/books
```

```
Sample Request Body
{
  "title": "Computer Networks",
  "author": "Andrew S. Tanenbaum",
  "isbn": "978-0132126953",
  "published_date": "May, 2020"
}
```

4. For deleting a book  
(http request type - DELETE)

```
http://localhost:3005/books/{id}
```

4. For adding images to a book
(http request type - POST)

```
http://localhost:3005/books/{book_id}/image
```

5. For deleting image of a book
(http request type - DELETE)

```
http://localhost:3005/books/{book_id}/image/{image_id}
```


### Public


1. For Creating User
(http request type - POST)

```
http://localhost:3005/v1/user
```

```
Sample Request Body

{
  "first_name": "Jane",
  "last_name": "Doe",
  "password": "skdjfhskdfjhg",
  "username": "jane.doe@example.com"
}
```


2. For getting all books
(http request type - GET)

```
http://localhost:3005/books
```

3. For getting book by id
(http request type - GET)

```
http://localhost:3005/books/{id}
```