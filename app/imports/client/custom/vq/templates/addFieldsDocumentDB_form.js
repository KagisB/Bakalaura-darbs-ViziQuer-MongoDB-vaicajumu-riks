import { Interpreter } from '/imports/client/lib/interpreter'
import { Elements } from '/imports/db/platform/collections'
import { VQ_Element } from '/imports/client/custom/vq/js/VQ_Element.js';

import './addFieldsDocumentDB_form.html'

Interpreter.customMethods({
  AddDocumentField: function () {
    //console.log("test before modal");
    let formSelect = $("#field-name-selection");
    let fieldsList = getFieldsList();
    for(let i = 0 ; i < fieldsList.length ; i++){
      let field = fieldsList[i];
      //console.log(field);
      let option = document.createElement("option");
      option.textContent = field;
      option.value = field;
      option.id = "field"+(i+1);
      formSelect.append(option);
    }
    $("#add-field-name-form").modal("show");
    //$("#add-class-name-form").modal("show");
    $('#field-name-field').val('');
    //console.log("test after modal");
    let selected_elem_id = Session.get("activeElement");
    //console.log(selected_elem_id);
    if (Elements.findOne({_id: selected_elem_id})){ //Because in case of deleted element ID is still "activeElement"
      //Read user's choise
      let vq_obj = new VQ_Element(selected_elem_id);
      //console.log(vq_obj);
      $('#field-name-field').val(vq_obj.getName());
    };


    // Setting up options for select form.
    //let formSelect2 = document.getElementById("class-name-selection");
  }
})


Template.AddDocumentField.helpers({

});


Template.AddDocumentField.events({

  "click #ok-add-field-name": function(e) {
    let selected_elem_id = Session.get("activeElement");
    if (Elements.findOne({_id: selected_elem_id})){ //Because in case of deleted element ID is still "activeElement"
      //Read user's choise
      //let vq_obj = new VQ_Element(Session.get("activeElement"));
      let selectedOptions = [];

      let selectedOptionsString = ""

      let choice = document.getElementById("field-name-selection");
      let selected = choice.selectedOptions;
      for(let i = 0 ; i < selected.length ; i++){
        let option = {//{name:"Expression",value:exp},
          name : selected[i].value,
          value : selected[i].value
        };
        let compName = "Field"+(i+1);
        let value = selected[i].value;
        selectedOptions.push(option);
        selectedOptionsString += value+", "
        //vq_obj.addCompartments();
        //vq_obj.setCompartmentValue(compName,value,value,true);
        //console.log(option);
      }
      //vq_obj.setName(name);
      //elem = new VQ_Element(ID)
      //let selectedTransformedOptions = [];
      //console.log(selectedOptions);
      //console.log(selectedOptionsString);
      let vq_obj = new VQ_Element(Session.get("activeElement"));
      //vq_obj.addCompartmentSubCompartments("Fields",selectedOptions) //– daudz rindu kompartmentiem
      vq_obj.setCompartmentValue("Fields",selectedOptionsString,selectedOptionsString);

    };
    return;
  },

  "keydown #field-name-field": function(e) {
    return;
  },

  "shown.bs.modal #add-field-name-form": function(e) {
    $('#class-name-field').focus();
  },

  "hidden.bs.modal #add-field-name-form": function(e) {

  },

});

/*
Function that creates a list that the form uses to populate the selection list with it's variables.
 */
function getFieldsList(){
    let fieldsList = ["vards","uzvards","dzimsanas_datums","darba_detalas","darba_detalas.Amata_nosaukums","darba_detalas.Alga",
      "adreses_detalas","adreses_detalas.Valsts","adreses_detalas.Novads","adreses_detalas.Pilseta","adreses_detalas.Iela","adreses_detalas.Majas_numurs","adreses_detalas.Dzivokla_numurs"];
    return fieldsList;//Kā attēlot to, ka ir apakšlauki?
}
