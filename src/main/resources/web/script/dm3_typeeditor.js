function dm3_typeeditor() {

    // javascript_source("vendor/dm3-typeeditor/script/base64.js")
    css_stylesheet("/de.deepamehta.3-typeeditor/style/dm3-typeeditor.css")

    // The type definition used for newly created topic types
    var DEFAULT_TYPE_DEFINITION = {
        uri: "http://www.deepamehta.de/core/topictype/UnnamedTopicType",
        fields: [
            {
                uri: "http://www.deepamehta.de/core/property/Name",
                model: {type: "text"},
                view: {label: "Name"},
                indexing_mode: "FULLTEXT"
            },
            {
                uri: "http://www.deepamehta.de/core/property/Description",
                model: {type: "html"},
                view: {label: "Description", editor: "multi line"},
                indexing_mode: "FULLTEXT"
            }
        ],
        view: {label: "Unnamed"},
        implementation: "PlainDocument"
    }

    // Used to create the field type menu.
    // TODO: let this table build dynamically by installed plugins
    var FIELD_TYPES = {
        text: "Text",
        number: "Number",
        date: "Date",
        html: "Styled Text (HTML)",
        relation: "Relation"
    }

    var field_editors



    /**************************************************************************************************/
    /**************************************** Overriding Hooks ****************************************/
    /**************************************************************************************************/



    this.custom_create_topic = function(type_uri) {
        if (type_uri == "http://www.deepamehta.de/core/topictype/TopicType") {
            var topic_type = create_topic_type(DEFAULT_TYPE_DEFINITION)
            return dmc.get_topic(topic_type.id)     // return the topic perspective of the type
        }
    }

    /**
     * Once a "Topic Type" topic is updated we must
     * 1) Update the cached type definition.
     * 2) Rebuild the "Create" button's type menu.
     *
     * @param   topic   The topic just created.
     *                  Note: in case the just created topic is a type, the entire type definition is
     *                  passed (object with "uri", "fields", "view", and "implementation" attributes).
     */
    this.post_create_topic = function(topic) {
        if (topic.type_uri == "http://www.deepamehta.de/core/topictype/TopicType") {
            alert("typeeditor.post_create_topic: Topic=" + JSON.stringify(topic))
            // 1) Update cached type definition
            var type_uri = topic.uri
            add_topic_type(type_uri, topic)     // Note: semantically this is an "update type" but
                                                // functional there is no difference to "add type"
            // 2) Rebuild type menu
            rebuild_type_menu("create-type-menu")
        }
    }

    this.post_update_topic = function(topic, old_properties) {
        if (topic.type_uri == "http://www.deepamehta.de/core/topictype/TopicType") {
            alert("typeeditor.post_update_topic: Topic=" + JSON.stringify(topic))
            // update type URI
            var old_type_uri = old_properties["http://www.deepamehta.de/core/property/TypeURI"]
            var new_type_uri = topic.properties["http://www.deepamehta.de/core/property/TypeURI"]
            if (old_type_uri != new_type_uri) {
                alert("Type URI changed from \"" + old_type_uri + "\" to \"" + new_type_uri + "\"")
                set_topic_type_uri(old_type_uri, new_type_uri)
            }
            // update type label
            var old_type_label = old_properties["http://www.deepamehta.de/core/property/TypeName"]
            var new_type_label = topic.properties["http://www.deepamehta.de/core/property/TypeName"]
            if (old_type_label != new_type_label) {
                alert("Type label changed from \"" + old_type_label + "\" to \"" + new_type_label + "\"")
                set_topic_type_label(new_type_uri, new_type_label)
            }
        }
    }

    this.post_delete = function(topic) {
        if (topic.type == "Topic" && topic.topic_type == "http://www.deepamehta.de/core/topictype/TopicType") {
            // 1) Update cached type definition
            var type_uri = get_value(topic, "type_uri")
            remove_topic_type(type_uri)
            // 2) Rebuild type menu
            rebuild_type_menu("create-type-menu")
        }
    }

    this.render_field_content = function(field, topic) {
        if (field.model.type == "field-definition") {
            var content = $("<ul>")
            for (var i = 0, field; field = get_topic_type(topic).fields[i]; i++) {
                content.append($("<li>").text(field_label(field) + " (" + FIELD_TYPES[field.model.type] + ")"))
            }
            return content
        }
    }

    this.render_form_field = function(field, topic) {
        if (field.model.type == "field-definition") {
            var table = $("<table>").attr("id", "field-editors")
            //
            var add_field_button = ui.button("add-field-button", do_add_field, "Add Field", "circle-plus")
            //
            var form_field = $("<div>")
            form_field.append(table)
            form_field.append(add_field_button.addClass("add-field-button"))
            return form_field
        }
    }

    /**
     * Adds the field editors to the page.
     *
     * Note: we must do this in the "post" hook because add_field_editor()
     * requires the "field-editors" table to exist on the page already.
     */
    this.post_render_form_field = function(field, topic) {
        if (field.model.type == "field-definition") {
            field_editors = []
            for (var i = 0, field; field = get_topic_type(topic).fields[i]; i++) {
                add_field_editor(field, i)
            }
        }
    }

    this.get_field_content = function(field) {
        if (field.model.type == "field-definition") {
            // prevent this field from being updated
            return null
        }
    }

    this.pre_submit_form = function(topic) {
        if (topic.type_uri == "http://www.deepamehta.de/core/topictype/TopicType") {
            // update type definition (add, remove, and update fields)
            var type_uri = topic.properties["http://www.deepamehta.de/core/property/TypeURI"]
            log("Updating topic type \"" + type_uri + "\" (" + field_editors.length + " data fields):")
            for (var i = 0, editor; editor = field_editors[i]; i++) {
                if (editor.field_is_new) {
                    // add field
                    log("..... \"" + editor.field_uri + "\" => new")
                    add_data_field(editor)
                } else if (editor.field_has_changed) {
                    // update field
                    log("..... \"" + editor.field_uri + "\" => changed")
                    update_data_field(editor)
                } else if (editor.field_is_deleted) {
                    // delete field
                    log("..... \"" + editor.field_uri + "\" => deleted")
                    remove_data_field(editor)
                } else {
                    log("..... \"" + editor.field_uri + "\" => dummy")
                }
            }
            // update type definition (icon)
            var icon_src = $("[field-uri=http://www.deepamehta.de/core/property/Icon] img").attr("src")
            get_topic_type(topic).view.icon_src = icon_src
            // doc.view.icon_src = icon_src
        }

        function add_data_field(editor) {
            var type_uri = topic.properties["http://www.deepamehta.de/core/property/TypeURI"]
            var field = editor.get_new_field()
            // update DB
            dmc.add_data_field(type_uri, field)
            // update memory
            add_field(type_uri, field)
        }

        function update_data_field(editor) {
            var type_uri = topic.properties["http://www.deepamehta.de/core/property/TypeURI"]
            // update memory
            var field = editor.update_field()
            log(".......... update_data_field() => " + JSON.stringify(field))
            // update DB
            dmc.update_data_field(type_uri, field)
        }

        function remove_data_field(editor) {
            var type_uri = topic.properties["http://www.deepamehta.de/core/property/TypeURI"]
            // update DB
            dmc.remove_data_field(type_uri, editor.field_uri)
            // update memory
            remove_field(type_uri, editor.field_uri)
        }
    }



    /************************************************************************************************/
    /**************************************** Custom Methods ****************************************/
    /************************************************************************************************/



    // FIXME: to be dropped
    function save_topic_type(type_id, typedef) {
        log("Saving topic type \"" + type_id + "\"")
        var type_topic = create_topic("Topic Type", {"type_id": type_id}, {type_definition: typedef})
        // icon
        if (typedef.view && typedef.view.icon_src) {
            var icon_src = typedef.view.icon_src
            var icon_id = dm3_icons.by_attachment(icon_src)
            if (icon_id) {
                log("..... icon topic for " + icon_src + " exists already")
            } else {
                log("..... creating icon topic for " + icon_src)
                var attachment = build_attachment(icon_src)
                var icon_topic = create_topic("Icon", {"Name": basename(icon_src)}, {_attachments: attachment})
                var icon_id = icon_topic._id
                log("..... " + icon_topic._id)
            }
            create_relation("Relation", type_topic._id, icon_id)
        }

        function build_attachment(icon_src) {
            var icon_data = db.openBinaryAttachment("_design/deepamehta3", icon_src)
            var encoded_data = Base64.encode(icon_data)
            log(".......... icon data: " + icon_data.length + " bytes")
            log(".......... " + dump(icon_data, 32))
            log(".......... " + encoded_data.substr(0, 50) + " (" + encoded_data.length + " base64 bytes)")
            var attachment = {}
            attachment[icon_src] = {
                content_type: mime_type(icon_src),
                data: encoded_data
            }
            return attachment
        }

        function dump(str, count) {
            var d = ""
            for (var i = 0; i < count; i++) {
                d += str.charCodeAt(i) + " "
            }
            return d
        }
    }

    function do_add_field() {
        // the default field is a single line text field, with yet empty ID and label
        var field = {id: "", model: {type: "text"}, view: {editor: "single line", label: ""}, content: ""}
        add_field_editor(field, field_editors.length)
    }

    function add_field_editor(field, i) {
        var field_editor = new FieldEditor(field, i)
        field_editors.push(field_editor)
        $("#field-editors").append(field_editor.dom)
    }



    /************************************/
    /********** Custom Classes **********/
    /************************************/



    /**
     * Constructs the GUI for editing an underlying data field model.
     * All changes are performed on a working copy, allowing the caller to cancel all changes.
     * Keeps track of user interaction and tells the caller how to update the actual data field model eventually.
     *
     * @param   field   the underlying data field model to edit
     */
    function FieldEditor(field, editor_id) {

        log("Creating FieldEditor for \"" + field.uri + "\" editor ID=" + editor_id);
        log("..... " + JSON.stringify(field))
        var editor = this
        var delete_button = ui.button("deletefield-button_" + editor_id, do_delete_field, "", "circle-minus")
        var fieldname_input = $("<input>").val(field_label(field))
        var fieldtype_menu = create_fieldtype_menu()
        var td1 = $("<td>").addClass("field-editor").append(delete_button.addClass("delete-field-button"))
        var td2 = $("<td>").addClass("field-editor")
        // - options area -
        // The options area holds fieldtype-specific GUI elements.
        // For text fields, e.g. the text editor menu ("single line" / "multi line")
        var options = clone(field)          // model
        var options_area = $("<span>")      // view
        var lines_input                     // view
        //
        td2.append($("<span>").addClass("field-name field-editor-label").text("Name"))
        td2.append(fieldname_input).append("<br>")
        td2.append($("<span>").addClass("field-name field-editor-label").text("Type"))
        td2.append(fieldtype_menu.dom).append(options_area)
        build_options_area()
        //
        this.field_uri = field.uri
        this.dom = $("<tr>").append(td1).append(td2)
        //
        this.field_is_new = !field.uri      // Maximal one of these 3 flags evaluates to true.
        this.field_is_deleted = false       // Note: all flags might evaluate to false. This is the case
        this.field_has_changed = field.uri  // for newly added fields which are removed right away.

        this.get_new_field = function() {
            field.uri = to_id(fieldname_input.val())
            update_field()
            return field
        }

        this.update_field = function() {
            return update_field()
        }

        /**
         * Reads out the status of the GUI elements (view) and updates the field (model) accordingly.
         */
        function update_field() {
            field.model = options.model
            field.view = options.view
            // Note: the input fields must be read out manually
            // (for input fields the "options" model is not updated on-the-fly)
            field.view.label = fieldname_input.val()
            if (lines_input) {
                field.view.lines = lines_input.val()
            }
            //
            if (field.model.type == "relation") {
                options.view.editor = "checkboxes"
            }
            return field
        }

        function create_fieldtype_menu() {
            var menu_id = "fieldtype-menu_" + editor_id
            var menu = ui.menu(menu_id, fieldtype_changed)
            menu.dom.addClass("field-editor-menu")
            // add items
            for (var fieldtype in FIELD_TYPES) {
                menu.add_item({label: FIELD_TYPES[fieldtype], value: fieldtype})
            }
            // select item
            menu.select(field.model.type)
            //
            return menu
        }

        function do_delete_field() {
            // update GUI
            editor.dom.remove()
            // update model
            if (editor.field_has_changed) {
                editor.field_is_deleted = true
                editor.field_has_changed = false
            } else {
                editor.field_is_new = false
            }
        }

        function fieldtype_changed(menu_item) {
            options.model.type = menu_item.value
            //
            // FIXME: must adjust model here, e.g. when switching from "relation" to "text" -- not nice!
            // TODO: let the adjustment do by installed plugins.
            switch (options.model.type) {
            case "text":
                if (options.view.editor == "checkboxes") {
                    options.view.editor = "single line"
                }
                break
            case "number":
                break
            case "date":
                break
            case "html":
                break
            case "relation":
                if (!options.model.related_type) {
                    options.model.related_type = keys(topic_types)[0]
                }
                break
            default:
                alert("ERROR (FieldEditor.fieldtype_changed):\nunexpected field type (" + options.model.type + ")")
            }
            //
            update_options_area()
        }

        function update_options_area() {
            options_area.empty()
            build_options_area()
        }

        function build_options_area() {
            // TODO: let the options area build by installed plugins
            switch (options.model.type) {
            case "text":
                // text editor menu
                build_texteditor_menu()
                // lines input
                if (options.view.editor == "multi line") {
                    build_lines_input()
                }
                break
            case "number":
                break
            case "date":
                break
            case "html":
                build_lines_input()
                break
            case "relation":
                build_topictype_menu()
                break
            default:
                alert("ERROR (FieldEditor.build_options_area):\nunexpected field type (" + options.model.type + ")")
            }

            function build_texteditor_menu() {
                var texteditor_menu = ui.menu("texteditor-menu_" + editor_id, texteditor_changed)
                texteditor_menu.dom.addClass("field-editor-menu")
                texteditor_menu.add_item({label: "Single Line", value: "single line"})
                texteditor_menu.add_item({label: "Multi Line", value: "multi line"})
                texteditor_menu.select(options.view.editor)
                //
                options_area.append(texteditor_menu.dom)

                function texteditor_changed(menu_item) {
                    options.view.editor = menu_item.value
                    update_options_area()
                }
            }

            function build_lines_input() {
                lines_input = $("<input>").attr("size", 3)
                lines_input.val(options.view.lines || DEFAULT_AREA_HEIGHT)
                //
                options_area.append($("<span>").addClass("field-name field-editor-label").text("Lines"))
                options_area.append(lines_input)
            }

            function build_topictype_menu() {
                var topictype_menu = create_type_menu("topictype-menu_" + editor_id, topictype_changed)
                topictype_menu.select(options.model.related_type)
                //
                options_area.append(topictype_menu.dom)

                function topictype_changed(menu_item) {
                    options.model.related_type = menu_item.label
                }
            }
        }
    }
}
