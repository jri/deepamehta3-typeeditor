function FieldDefinitionRenderer(doc, field, rel_topics) {

    var plugin = get_plugin("dm3_typeeditor")



    /**************************************************************************************************/
    /**************************************** Overriding Hooks ****************************************/
    /**************************************************************************************************/



    this.render_field = function() {
        // field label
        render.field_label(field)
        // field value
        var value = $("<ul>")
        for (var i = 0, fld; fld = get_topic_type(doc).fields[i]; i++) {
            // Note: we use "fld" name here to not clash with "field" closure variable
            // (render.field_label() above would fail).
            value.append($("<li>").text(fld.label + " (" + plugin.DATA_TYPES[fld.data_type].label + ")"))
        }
        return value
    }

    this.render_form_element = function() {
        var editors_list = $("<ul>").attr("id", "field-editors")
        var add_field_button = ui.button("add-field-button", plugin.do_add_field, "Add Data Field", "circle-plus")
        //
        var form_field = $("<div>")
        form_field.append(editors_list)
        form_field.append(add_field_button.addClass("add-field-button"))
        return form_field
    }

    /**
     * Adds the field editors to the page.
     *
     * Note: we must do this in the "post" hook because add_field_editor()
     * requires the "field-editors" list to exist on the page already.
     */
    this.post_render_form_element = function() {
        for (var i = 0, field; field = get_topic_type(doc).fields[i]; i++) {
            plugin.add_field_editor(field, i)
        }
        //
        $("#field-editors").sortable()
    }

    this.read_form_value = function() {
        // prevent this field from being updated
        return null
    }
}
