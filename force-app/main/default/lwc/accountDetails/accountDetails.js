import { LightningElement , wire, api} from 'lwc';
import getParentAccounts from '@salesforce/apex/AccountHelper.getParentAccounts';
import Label from '@salesforce/schema/ActionLinkTemplate.Label';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from "@salesforce/schema/Account";
import ACCOUNT_ID from "@salesforce/schema/Account.Id";
import ACCOUNT_PARENT from "@salesforce/schema/Account.ParentId";
import ACCOUNT_NAME from "@salesforce/schema/Account.Name";
import ACCOUNT_SLA_EXPIRY_DT from "@salesforce/schema/Account.SLAExpirationDate__c";
import ObjectApiName from '@salesforce/schema/ExpressionSetObjectAlias.ObjectApiName';
import ACCOUNT_SLA_TYPE from "@salesforce/schema/Account.SLA__c";
import ACCOUNT_NO_OF_LOCATION from "@salesforce/schema/Account.NumberofLocations__c";
import ACCOUNT_DESCRIPTION from "@salesforce/schema/Account.Description";
import { createRecord, getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const fieldsToLoad = [ACCOUNT_PARENT, ACCOUNT_NAME, ACCOUNT_SLA_TYPE, ACCOUNT_SLA_EXPIRY_DT, ACCOUNT_NO_OF_LOCATION, ACCOUNT_DESCRIPTION];

export default class AccountDetails extends NavigationMixin(LightningElement) {

    parentoptions = [];
    selParentAcc = "";
    selnoOfLocations = "1";
    selAccName = "";
    selExpDate = null;
    selDescription = "";
    selSlaType = "";
    @api recordId;

    @wire(getRecord, {
        recordId: "$recordId",
        fields: fieldsToLoad

    })wiredgetRecord_Function({data, error}){
        if(data){
            this.selParentAcc = getFieldValue(data, ACCOUNT_PARENT);
        this.selnoOfLocations = getFieldValue(data, ACCOUNT_NO_OF_LOCATION);
        this.selAccName = getFieldValue(data, ACCOUNT_NAME);
        this.selExpDate = getFieldValue(data, ACCOUNT_SLA_EXPIRY_DT);
        this.selDescription = getFieldValue(data, ACCOUNT_DESCRIPTION);
        this.selSlaType = getFieldValue(data, ACCOUNT_SLA_TYPE);

        }else if(error){
            console.log("Error message during retrieval", error);
        }
        

    }


    @wire(getParentAccounts) wired_getParentAccount({data, error}){
        this.parentoptions = [];
        if(data){
            
            this.parentoptions = data.map((curritem) => ({
                label: curritem.Name,
                value: curritem.Id
            }));

        }else if(error){
            console.log("Error while getting parent records", error);
        }
    }

    @wire(getObjectInfo, {
        objectApiName: ACCOUNT_OBJECT   
    })
    accountobjectinfo;

    @wire(getPicklistValues, {
        recordTypeId: "$accountobjectinfo.data.defaultRecordTypeId",
        fieldApiName: ACCOUNT_SLA_TYPE
    })
    slapicklist;

    handleChange(event){
        let {name, value } = event.target;
        if(name === "parentacc"){
            this.selParentAcc = value;
        }
        if(name === "slaexpdt"){
            this.selExpDate = value;
        }
        if(name === "accname"){
            this.selAccName = value;
        }
        if(name === "slatype"){
            this.selSlaType = value;
        }
        if(name === "nooflocations"){
            this.selnoOfLocations = value;
        }
        if(name === "description"){
            this.selDescription = value;
        }
        
    }

    saveRecord(){
        console.log("ACCOUNT_OBJECT ", ACCOUNT_OBJECT);
        console.log("ACCOUNT_NAME ", ACCOUNT_NAME);
        if(this.validateInput()){
            console.log('in 1st if');
            
            let inputfields = {};
            inputfields[ACCOUNT_NAME.fieldApiName] = this.selAccName;
            inputfields[ACCOUNT_PARENT.fieldApiName] = this.selParentAcc;
            inputfields[ACCOUNT_SLA_TYPE.fieldApiName] = this.selSlaType;
            inputfields[ACCOUNT_SLA_EXPIRY_DT.fieldApiName] = this.selExpDate;
            inputfields[ACCOUNT_NO_OF_LOCATION.fieldApiName] = this.selnoOfLocations;
            inputfields[ACCOUNT_DESCRIPTION.fieldApiName] = this.selDescription;
            if(this.recordId){
                console.log('in 2nd if');
                // update account
                inputfields[ACCOUNT_ID.fieldApiName] = this.recordId;
                let recordInput = {
                    fields: inputfields
                };
                console.log("record input success");
                updateRecord(recordInput)
                .then((result) => {
                    console.log("Record Updated Successfully", result);
                    this.showToast();
                })
                .catch((error) => {
                    console.log("Record Updation failed", error);
                });

            }else {
                let recordInput = {
                    apiName: ACCOUNT_OBJECT.objectApiName,
                    fields: inputfields
                }
                createRecord(recordInput)
                .then((result) => {
                    console.log("Account Created Successfully", result);
                    let pageRef = {
                        type: 'standard__recordPage',
                        attributes: {
                            recordId: result.id,
                            objectApiName: ACCOUNT_OBJECT.objectApiName,
                            actionName: 'view'
                        }
                };
                this[NavigationMixin.Navigate](pageRef);
                })
                .catch((error) => {
                    console.log("Error in creation ", error);
                });

            }
            
        }else{
            console.log("Input are not valid");
        }

    }

    validateInput(){
        let fields = Array.from(this.template.querySelectorAll(".validateme"));
        let isValid = fields.every((curritem) => curritem.checkValidity());
        console.log("Check record input", isValid);
        return isValid;
    }

    get formTitle(){
        if(this.recordId){
            return "Edit Account";
        }else {
            return "Create Account";
        }

    }

    showToast() {
        const event = new ShowToastEvent({
            title: 'Success',
            message:
                'Record Updated Successfully'
        });
        this.dispatchEvent(event);
    }
}