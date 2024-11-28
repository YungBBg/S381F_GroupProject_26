## 1.Project info:
### Project name : Restaurant Store Management

## Group Members
### 1. 13665281 Chow Hang Tat
### 2. 13506177 Wong Kam Fat
### 3. 13665011 Yung Chun Kwok
### 4. 13566997 Tsang Tsz Kin

## 2.Prject file intro:

### server.js:

| Feature               | Description                                                                                  |
|-----------------------|----------------------------------------------------------------------------------------------|
| Login/Logout Pages    | Users must login to access the CRUD web pages. Authentication can use session, OAuth, etc.   |
| Create Functionality  | Allows users to create new data objects with a button or UI.                                 |
| Read Functionality    | Lets users search data by different query conditions.                                        |
| Update Functionality  | Enables users to update existing data objects through UI elements.                           |
| Delete Functionality  | Provides users the ability to delete data objects with UI controls.                          |
| RESTful APIs          | Exposes CRUD operations via HTTP methods (GET, POST, PUT, DELETE).                           |

### package.json:
    "ejs": "^3.1.10",
    "express": "^4.21.1",
    "express-formidable": "^1.2.0",
    "express-session": "^1.18.1",
    "mongodb": "^6.11.0",
    "passport": "^0.7.0",
    "passport-facebook": "^3.0.0"

### public : 


### views  : 
+ Create.ejs
+ Detail.ejs
+ Edit.ejs
+ Info.ejs
+ List.ejs
+ Login.ejs

### models : 


# 3.The cloud-based server URL
- URL_AWS ( https://gp26.onrender.com/ )


# 4.Operation guides

1. Login
    > Open the login page.
    >> Login the mata developer with facebook
    >>> Click "Login From Facebook" button in login page.
    >>>> You will see a autu page, click blue button to login.If you login success, you will see home page(list.ejs).

2. List
    > You can check all data in the list page
    >> click item name to check detail of item.

3. Dateils
    >click item name to check detail of item.
    >>the table will show the item and relation data what item you have selected.

4. Create
    > Cliick create button to create new item in home page
    >> When you go to the create item page, you need to enter all data information of your item.
    >>> You can click upload button to upload item image.
    >>>> When all data have enter it, click create button to create new item, the new item will show in the table of home page. 

5. Edit
    > Click edit button in item detail page to update item.
    >> If you are the item owner, you can edit it, otherwise you will show error message and not accept you to update it.
    >>> If you edited it, chick update button to finish update data, and you will see the reational data have updated in home page. 

6. Delete
    >Click item name to check detail of item in home page.
    >>When you enter to detail page, check delete button.
    >>>If you are the item owner, you can see the delete message after delete success, otherwise you will show error message and not accept you to delete it if you not the item owner.
7. Logout 
    > All page have a logout button
    >> When you click the logout button, you will logout successful and go back to login page.

## RESTful CRUD services
    1 curl -X POST http://localhost:10000/api/items \-F "item=apple" \-F "price=99.99" \-F "quantity=10" \-F "description=Test description" \-F "filetoupload=@/home/yungchunkwok/task2/views/apple.jpg"

        
    2 curl -X GET http://localhost:10000/api/item/apple

        
    3 curl -X PUT -H "Content-Type: application/json" --data '{"item":"apple123","price":"20","quantity":"200","description":"Yummy"}' localhost:10000/api/item/apple

        
    4 curl -X DELETE localhost:10000/api/item/apple123
   
