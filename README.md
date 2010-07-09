
Type Editor Plugin for DeepaMehta 3
===================================

The Type Editor plugin allows interactive creation and modification of topic types. You can e.g. create a topic type "Book" along with its data fields "Title", "Author", "Abstract", "Publication Date". Once the "Book" topic type is defined you can create books and search for books (type-based searching is provided by the optional Typing plugin).

Data fields carries data of different types. There are 5 data field types: *Text*, *Number*, *Date* (backed by a datepicker widget), *Styled Text* (backed by a WYSIWYG editor), and *Relation*. The latter is special: a Relation data field carries a relation to another topic. In the book example the "Author" data field could carry a relation to a *Person* topic.

When the Type Editor plugin is installed you can also modify the topic types that already exist on your DeepaMehta 3 installation. These include the core topic types (like *Note*) as well as the topic types provided by other plugins (like *Person* and *Institution* as provided by DM3 Contact plugin).

DeepaMehta 3 is a platform for collaboration and knowledge management.  
<http://github.com/jri/deepamehta3-parent>


Requirements
------------

* A DeepaMehta 3 installation  
  <http://github.com/jri/deepamehta3-parent>

* Other DeepaMehta 3 plugins:

    - *Iconpicker*  
        <http://github.com/jri/deepamehta3-iconpicker>  
        The Iconpicker plugin let you attatch an icon to a topic type by means of an iconpicker widget.

    - *Typing* (optional install)  
        <http://github.com/jri/deepamehta3-parent>  
        The Typing plugin provides a type-based search.  
        (FIXME: doesn't exists yet)


Install
-------

The most easy way to use the Type Editor plugin is to install the DeepaMehta 3 binary distribution as it is pre-packaged with a set of useful plugins. The installation is described here:  
<http://github.com/jri/deepamehta3-parent>


Usage Hints
-----------

*   Create a new topic type by choosing *Topic Type* from the Create menu and click the *Create* button.
    (A topic type is itself a topic and is represented on the canvas.) Enter a name for the topic type.

*   Add a data field by clicking the *Add Data Field* button. Name the data field and choose its type.
    Five data field types are available: *Text*, *Number*, *Date*, *Styled Text*, and *Relation*.
    Depending on the data field type set further options for the data field, e.g. for Relation fields
    choose the related topic type.

*   Change the order of the data fields by dragging them around.

*   Remove a data field by clicking its "Close" button (upper right corner).

*   When you're done with the type definition, click the *Save* button.
    The newly created type now appears in the Create menu -- ready for creating topics of that type.

*   Delete a topic type by revealing it, and then delete it (just like any other topic).

*   Note: When you change a topic type definition, e.g. by renaming it, or by adding/removing fields,
    or even when you delete the topic type, all this doesn't affect existing topics of that type.
    (FIXME: not true anymore)


Version History
---------------

**v0.4** -- upcoming

* New data field type: *Number*
* The order of data fields is changable by drag and drop
* Compatible with DeepaMehta 3 v0.4

**v0.3** -- Mar 6, 2010

* Basic functionality
* Compatible with DeepaMehta 3 v0.3


------------
Jörg Richter  
July 9, 2010
