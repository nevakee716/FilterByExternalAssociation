| **Name** | **Filter By External Association** | **Version** | 1.2 |
| --- | --- | --- | --- |
| **Updated by** | Mathias PFAUWADEL |

## Description 
Allow you to filter items on a node depending on an association

## Installation
https://github.com/casewise/cpm/wiki

## Parameter setup 

DisplayName : Set the layout javascript class name you want to use to display this node

Filter In : Set the id(s) of the node(s) which should be display if the association exists

Display if all selected association of an association type : Element need to have all selected association of an association type to be displayed

Display if at least one association in all association type : Element need to have at least one association in all association type to be displayed

## How to set association filter
### Exemple 1
Here with have the following metamodel
Process level 2 associated with Process level 3
Process level 3 associated with Sites
Process level 3 associated with Application


We want to display the following list :
- Process level 2
  - Process level 3

And be able to display only the Process level 3 that have the association with a chosen Sites or Applications (you can put as much association type you want)

Here is a list with the associations
![](https://raw.githubusercontent.com/nevakee716/FilterByExternalAssociation/master/screen/1.png)

The layout configure like this : 
![](https://raw.githubusercontent.com/nevakee716/FilterByExternalAssociation/master/screen/2.png)

and here is the result if we select Paris
![](https://raw.githubusercontent.com/nevakee716/FilterByExternalAssociation/master/screen/3.png)
![](https://raw.githubusercontent.com/nevakee716/FilterByExternalAssociation/master/screen/4.png)
Here we see all the Process level 2 which are in Paris

We can select 1 or more association.(See option to see the behaviour of the list)
![](https://raw.githubusercontent.com/nevakee716/FilterByExternalAssociation/master/screen/5.png)
![](https://raw.githubusercontent.com/nevakee716/FilterByExternalAssociation/master/screen/6.png)
Here we see all the Process level 2 which are in Paris or(can be modify with option) in Lyon






