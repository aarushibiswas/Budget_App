var budgetController = (function(){
    var Expense = function(id,description,value) {
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    }
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value/totalIncome) * 100 );
        }else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    var Income = function(id,description,value) {
        this.id=id;
        this.description=description;
        this.value=value;
    }

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum = sum + cur.value;
        });
        data.total[type] = sum ;
    };

    var data = {
        allItems:{
            exp:[],
            inc:[]
        },
        total:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage: -1
    };
    return {
        addItem : function (type,des,val) {
            var newItem,ID;

            //Create new ID
            data.allItems[type].length > 0 ? ID = data.allItems[type][data.allItems[type].length - 1].id + 1 : ID = 0;
            //Create new item based on inc or exp
            if(type === "exp"){
                newItem=new Expense(ID,des,val);
            }
            else if(type === "inc"){
                newItem=new Income(ID,des,val);
            }

            //Push it into our data structure
            data.allItems[type].push(newItem);

            //Returning newItem
            return newItem;
        },
        deleteItem : function(type,ID){
            var newData = data.allItems[type].filter(function(item){
                return (item.id!==ID) ;
            });
            data.allItems[type]=newData;
            console.log(data.allItems[type]);
        },
        calculatePercentages : function(){
            data.allItems.exp.forEach(function(cur){
                return cur.calcPercentage(data.total.inc);
            });
        },
        getPercentages : function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        calculateBudget : function(){
            //Calculate total inc and exp
            calculateTotal("exp");
            calculateTotal("inc");
            //Calculate the budget: Inc - exp
            data.budget = data.total.inc - data.total.exp;
            //Calculate percentage of Inc that we spent
            if(data.total.inc > 0){
                data.percentage = Math.round((data.total.exp/data.total.inc)*100);
            }
            else{
                data.percentage = -1;
            }
        },
        getBudget : function(){
            return {
                budget : data.budget,
                totalInc : data.total.inc,
                totalExp : data.total.exp,
                percentage : data.percentage
            };
        }
        // testing:function () {
        //     console.log(data);
        // }
    }
})();

var UIController = (function(){
    var DOMstrings={
        type: ".add__type",
        description:".add__description",
        value:".add__value",
        inputBtn:".add__btn",
        incomeContainer:".income__list",
        expenseContainer:".expenses__list",
        budgetLabel:".budget__value",
        incomeLabel:".budget__income--value",
        expenseLabel:".budget__expenses--value",
        percentageLabel:".budget__expenses--percentage",
        container:".container",
        expensesPercentageLabel:".item__percentage",
        dateLabel:".budget__title--month",
        inputType:".add__type"
    }
    function formatNumber(num,type){
        var numSplit,int,dec,type;
        num=Math.abs(num);
        num=num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0,int.length - 3)+','+int.substr(int.length-3,int.length);
        }
        dec=numSplit[1];

        return (type === "exp" ? "-" : "+") + ' ' + int + '.' + dec;
    }
    var nodeListForEach = function(list,callback){
        for(var i=0;i<list.length;i++){
            callback(list[i],i);
        }
    };
    return {
        //The starting point .
        getInput: function(){
            return {
        type: document.querySelector(DOMstrings.type).value,
        description:document.querySelector(DOMstrings.description).value,
        value:parseFloat(document.querySelector(DOMstrings.value).value)
            };
        },
        addListItem : function (obj,type) {
            var html,newHtml, element;
            //Create html string with placeholder text
            if(type === "inc"){
                element=DOMstrings.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === "exp"){
                element=DOMstrings.expenseContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix">    <div class="item__value">%value%</div>    <div class="item__percentage">21%</div>    <div class="item__delete">        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>    </div></div></div>';
            }
            //Replace the placeholder text with some actual data
            newHtml=html.replace("%id%",obj.id);
            newHtml=newHtml.replace("%description%",obj.description);
            newHtml=newHtml.replace("%value%",formatNumber(obj.value,type));
            //Insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend",newHtml);
        },
        deleteListItem : function(selectorID){
            var el = document.getElementById(selectorID);
            (el.parentNode).removeChild(el);
        },
        clearFields : function(){
            var fields,fieldsArr;
            fields=document.querySelectorAll(DOMstrings.description+', '+ DOMstrings.value);
            fieldsArr=Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current){
                current.value="";
            });
            fieldsArr[0].focus();
        },
        displayPercentages : function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
            nodeListForEach(fields,function(current,index){
                if(percentages[index] > 0){
                current.textContent = percentages[index] + "%";
                }else{
                    current.textContent = "---";
                }
            });
        },
        displayMonth : function(){
            var now,year,month,months;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
            document.querySelector(DOMstrings.dateLabel).textContent=months[month] + ' ' + year;
        },
        displayBudget : function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp' ;
            document.querySelector(DOMstrings.budgetLabel).textContent=formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent=formatNumber(obj.totalExp,'exp');
            if(obj.percentage > 0){
            document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent='---'; 
            }
        },
        changedType : function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + DOMstrings.description + ',' + DOMstrings.value
            );
            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        getDOM : function(){
            return DOMstrings;
        }
    };
})();

var controller = (function(budgetCtrl,UICtrl){ 

    var setupEventListeners = function(){//Giving the ignition to the app.
        var DOM=UICtrl.getDOM();
        //This is a click listener
        document.querySelector(DOM.inputBtn).addEventListener("click",ctrlAddItem);
        //This is a return or enter key listener(enter key keycode = 13)
        document.addEventListener("keypress",function(event){
        if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
        }
    });
        document.querySelector(DOM.container).addEventListener("click",ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener("change",UICtrl.changedType);
    }
    updatePercentages = function(){
        //1. Calculate percentages
        budgetCtrl.calculatePercentages();
        //2. Read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        //3. Update UI with percentage
        // console.log(percentages);
        UICtrl.displayPercentages(percentages);
    }
    var updateBudget= function(){
        //Calculate the budget
        budgetCtrl.calculateBudget();
        //Return the budget
        var budget = budgetCtrl.getBudget();
        //Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    var ctrlAddItem = function(){
        // 1. Get the field input data
        var input = UICtrl.getInput();
        //To check if input is not empty
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){

        //console.log(input);

        //2. Add the item to the budget controller
        var newItem = budgetCtrl.addItem(input.type,input.description,input.value);
        // budgetCtrl.testing();
        //3. Add the item to the UI. 
        UICtrl.addListItem(newItem,input.type);
        //4. Clear the input fields
        UICtrl.clearFields();
        //5. Calculate and update the budget. 
        updateBudget();
        //6. Calculate and update percentages
        updatePercentages();
        }
    }
    var ctrlDeleteItem = function(event){
        var itemID,splitID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
        splitID = itemID.split('-');
        type = splitID[0];
        ID = parseInt(splitID[1]);
        //1. Delete the item from data structure
        budgetCtrl.deleteItem(type,ID);
        //2. Delete the item from the UI
        UICtrl.deleteListItem(itemID);
        //3. Update and show the new budget
        updateBudget();
        //4. Calculate and update percentages
        updatePercentages();
        }
    } 
    
    return {
        init: function(){
            console.log("Application has started");
            UICtrl.displayBudget(
                {
                    budget : 0,
                    totalInc : 0,
                    totalExp : 0,
                    percentage : -1
                }
            );
            UICtrl.displayMonth();
            setupEventListeners();
        } 
    };

})(budgetController,UIController);

controller.init();