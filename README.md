
# shoppingCart-REST-API-NodeJs
This is a rest-api for shopping websites authenticated using JWT.</br></br>
Use Postman tool to test the API.</br></br>
Product Schema:</br>
1.Name</br>
2.Brand</br>
3.Price</br>
4.Rating</br>
5.Delivery(Free/Paid)</br>
6.Stock</br>
7.Colors</br>
8.Fit</br>
9.Tag</br>

Available Endpoints:
| Route         | Method        |Response|              Body      |
| ------------- |:-------------:| -----:| -------:                    |
|route/allproducts     | GET | Gives all available products |Empty
|route/     | GET      |  Home Page |                   Empty|
|route/register | POST      |   Registration status |  Name,Email,Location,Password     |
|route/login|POST|Login Status|Email,Password|
|route/searchbytag/:tag|GET|Product with given tag|empty|
|route/searchbyid/:id|GET|Product with given tag|empty|
|route/addtocart/:id|POST|Cart addition status|Must be logged in|
|route/viewmycart|GET|Cart|Must be logged in|
|route/logout|POST|Logged out|Empty|
|route/:tag/filter|GET|Products with filters apllied|Required Filter|</br>
