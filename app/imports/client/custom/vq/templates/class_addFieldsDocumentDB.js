import { get_multi_fields_obj } from '/imports/client/platform/templates/diagrams/dialog/subCompartments'

import './class_addFieldsDocumentDB.html'

Template.class_addFieldsDocumentDB.helpers({

  multi_fields_obj: function() {
    let res = get_multi_fields_obj();
    // TODO: update form name
    //_.extend(res, {next_level_form: "AddNewAttribute"});
    _.extend(res, {next_level_form: "AddNewFieldDocumentDB"});
    return res;
  },
});
