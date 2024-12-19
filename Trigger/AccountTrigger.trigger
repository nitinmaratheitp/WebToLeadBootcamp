trigger AccountTrigger on Account(before insert, before update, before delete)
{
    /*
if(trigger.isBefore)
{
if(trigger.isInsert)
{
AccountTriggerHandler.updateAccountRating(trigger.new, null);
}
else if(trigger.isUpdate)
{
AccountTriggerHandler.updateAccountRating(trigger.new, trigger.oldMap);
}
}
*/
    
    if(trigger.isBefore)
    {
        if(trigger.isInsert)
        {
            AccountTriggerHandler.updateAnnualRevenue(trigger.new, null);
        }
        else if(trigger.isUpdate)
        {
            AccountTriggerHandler.updateAnnualRevenue(trigger.new, trigger.oldMap);
        }
        else if(trigger.isdelete){
            AccountTriggerHandler.checkAllOpportunityClosed(trigger.old);
        }
    }
    
    
    
    
}