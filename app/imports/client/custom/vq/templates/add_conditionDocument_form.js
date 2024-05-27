import { Interpreter } from '/imports/client/lib/interpreter'
import { Elements } from '/imports/db/platform/collections'
import { VQ_Element } from '/imports/client/custom/vq/js/VQ_Element.js';

import './add_conditionDocument_form.html';
//import './test_condition_form.html'
import './addFieldsDocumentDB_form.html'

Interpreter.customMethods({
  AddDocumentCondition: function () {
    //console.log("test before modal");
    let formSelectOperator = $("#operator-selection");
    let operatorsList = getOperatorList();
    //console.log(fieldsList);
    //for(let field in fieldsList){
    let i = 1;
    for (const [key, value] of operatorsList) {
      let option = document.createElement("option");
      option.textContent = key;
      option.value = value;
      option.id = "operator"+(i);
      formSelectOperator.append(option);
      i++;
    }
    //Radās kļūdas ar importiem, kad tika mēģināts mainīt manuālo teksta ievadi uz izvēli no opcijām
    /*let formSelectField = $("#field-selection");
    let fieldsList = getFieldsList();
    for(i = 0 ; i < fieldsList.length ; i++){
      let field = fieldsList[i];
      //console.log(field);
      let option = document.createElement("option");
      option.textContent = field;
      option.value = field;
      option.id = "field"+(i+1);
      formSelectField.append(option);
    }*/
    $("#add-condition-name-form").modal("show");
    //$("#add-class-name-form").modal("show");
    $('#conditionName-field').val('');
    $('#value-name-field').val('');

    //console.log("test after modal");
    let selected_elem_id = Session.get("activeElement");
    //console.log(selected_elem_id);
    if (Elements.findOne({_id: selected_elem_id})){ //Because in case of deleted element ID is still "activeElement"
      //Read user's choise
      let vq_obj = new VQ_Element(selected_elem_id);
      //console.log(vq_obj);
      $('#condition-name-field').val(vq_obj.getName());
    };


    // Setting up options for select form.
    //let formSelect2 = document.getElementById("class-name-selection");
  }
});


Template.AddDocumentCondition.helpers({

});


Template.AddDocumentCondition.events({

  "click #ok-add-condition-name": function(e) {
    let selected_elem_id = Session.get("activeElement");
    if (Elements.findOne({_id: selected_elem_id})){ //Because in case of deleted element ID is still "activeElement"
      //Read user's choise

      let selectedConditionsString = ""

      let choiceField = document.getElementById("conditionName-field");
      let choiceValue = document.getElementById("value-name-field");

      let choiceOperator = document.getElementById("operator-selection");
      let operator = choiceOperator.selectedOptions;
      //console.log(operator);
      let operatorValue =  operator[0].value;
      //let field = choiceField.selectedOptions;
      //let fieldValue = field[0].value
      //selectedConditionsString += fieldValue + "; " + operatorValue + "; " + choiceValue.value + ",";
      selectedConditionsString += choiceField.value + "; " + operatorValue + "; " + choiceValue.value + ",";
      console.log(selectedConditionsString);
      let vq_obj = new VQ_Element(Session.get("activeElement"));
      //vq_obj.addCompartmentSubCompartments("Fields",selectedOptions) //– daudz rindu kompartmentiem
      let existingConditionsString = vq_obj.getCompartmentValue("Conditions");
      if(existingConditionsString !== null){
        existingConditionsString += selectedConditionsString;
      }else{
        existingConditionsString = ""+selectedConditionsString;
      }
      vq_obj.setCompartmentValue("Conditions",existingConditionsString,existingConditionsString);
    };
    return;
  },

  "keydown #condition-name-field": function(e) {
    return;
  },

  "shown.bs.modal #add-condition-name-form": function(e) {
    $('#condition-name-field').focus();
  },

  "hidden.bs.modal #add-condition-name-form": function(e) {

  },

});

/*
Function that creates a list that the form uses to populate the selection list with it's variables.
 */
function getOperatorList(){
  //let operatorList = ["vards","uzvards","dzimsanas_datums","darba_detalas","adreses_detalas"]

// Iterating over the Map using for...of
  let operatorList = new Map();
  /**
   * $eq
   * Matches values that are equal to a specified value.
   * $gt
   * Matches values that are greater than a specified value.
   * $gte
   * Matches values that are greater than or equal to a specified value.
   * $in
   * Matches any of the values specified in an array.
   * $lt
   * Matches values that are less than a specified value.
   * $lte
   * Matches values that are less than or equal to a specified value.
   * $ne
   * Matches all values that are not equal to a specified value.
   * $nin
   * Matches none of the values specified in an array.
   */
  operatorList.set('=', 'eq');
  operatorList.set('>', 'gt');
  operatorList.set('>=', 'gte');
  operatorList.set('in', 'in');
  operatorList.set('<', 'lt');
  operatorList.set('<=', 'lte');
  operatorList.set('!=', 'ne');
  operatorList.set('not in', 'nin');
  return operatorList;
}

function getFieldsList(){
  let fieldsList = ["vards","uzvards","dzimsanas_datums","darba_detalas","darba_detalas.Amata_nosaukums","darba_detalas.Alga",
    "adreses_detalas","adreses_detalas.Valsts","adreses_detalas.Novads","adreses_detalas.Pilseta","adreses_detalas.Iela","adreses_detalas.Majas_numurs","adreses_detalas.Dzivokla_numurs"];
  return fieldsList;
}

