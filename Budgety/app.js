//Budget Controller

var budgetController = (function(){
    //Expense Proto 
    //Constructor for the Object Expense
    var Expense = function(id,description,value){
        this.id= id;
        this.description = description;
        this.value= value;
        
    };
    //Done to add the function to calulate percentage to the Expense Prototype
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0){

            // Percentage from this Expense object is rounded off and calculated
            
            this.percentage = Math.round((this.value /totalIncome)*100);  // Math round method is used to get a rounded number
        
        }
        
        else{
            
            //We declare -1 as its like language standard to say its non existent           
            this.percentage = -1 ;
        
        }
    
    }

    //Done to add the function to get the calculated percentage to the Expense object
    Expense.prototype.getPercentage = function () {
        //Returns the percentage of this object 
        return this.percentage;
    }

    //Constructor for the Object Income
    var Income = function(id,description,value){
        //Id
        this.id= id;
        //Description   
        this.description = description;
        //Value
        this.value= value;
    };

/*
    var allExpenses =[];
    var allIncomes =[];
    var totalExpenses= 0;
*/

//Function to calculate the total of the Inc and Exp 
var calculateTotal = function (type) {
    //Sum variable to store the total 
    var sum = 0;
    data.allItems[type].forEach(function (cur) {
        //Selects the value attribute in the current object
        sum = sum + cur.value;
       
        /*
        sum = 0
        array =[200,400,600]
        sum = 0 +200;
        sum = 200 + 400 and so on
        */

    });
    data.totals[type] = sum;

}
//This is more efficient way of Organizing our datastructures
    var data={
        //all items is the array with all the nodes or inquiries separtely in a list
        allItems:{
            exp:[],
            inc:[]
        },

        //List of all the totals 

        totals:{
            exp: 0,
            inc: 0
        },
        //Total Budget that is displayed on the top of the webpage
        
        budget: 0,
        
        //-1 is normally used to say the value is non existent
        
        //Where the percentage is stored
        percentage: -1
    };

    //All the public Functions for the Budget Controller class
    return {
        addItem: function(type,des,val){
            var newItem;
            
            //[1,2,3,4,5], next ID= 6 the flaw in this approach is that when we delete stuff its gonna be problematic 
            //[1,2,4,6,8] ,next ID = 9
            //id= last ID + 1

            //Create new item based on 'inc' or 'exp' type
            if(data.allItems[type].length > 0 ){
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else{
                ID = 0;
            }
            if(type === 'exp'){
                newItem = new Expense(ID,des,val);
            }
             else if(type==='inc'){
                newItem = new Income(ID,des,val);
            }
            //Push it into our Data Structures
            data.allItems[type].push(newItem);

            //Return the new Item
            return newItem;

        },
        deleteItem : function (type,id) {
            //Controller will have to pass the type and the id
            var ids,index;
            ids = data.allItems[type].map(function (current) {
                return current.id;                
            });
            index = ids.indexOf(id);

            if(index !== -1 ){
                data.allItems[type].splice(index,1);
            }

            
        },
        calculateBudget: function(){

        //calculate total income and expenses
        calculateTotal('inc');
        calculateTotal('exp');
        //calculate the budget: income -expenses
        data.budget = data.totals.inc - data.totals.exp;

        //calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100) ;
            }
            else {
                data.percentage = -1;
            }
        
        },
        
        calculatePercentages: function (){
            
           data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
           })
        },

        getPercentages:function () {
          var allPerc = data.allItems.exp.map(function(cur){
            return cur.getPercentage();
          });
          return allPerc;
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function(){
            console.log(data);
        }
    }
})();


//UI CONTROLLER

var UIController = (function(){


    var DOMstrings ={
        
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputBtn:'.add__btn',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    };
    var formatNumber  = function (num,type){
            
        var numSplit;
        /* 
        + or - before number for diffrent types 
        exactly 2 deicmal points 
        comma separtating the thousands 

        2310.4567 -> 2,310.46
        2000 - > 2,000.00
        */
    
        num = Math.abs(num);
        // add two decimals to the number if more than 2 already exist then it rounds it off it gives off a string tho so keep that in mind
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if( int.length >3 ) {
            //Substring allows us to take only a part of the string
            int = int.substr(0,int.length - 3) + ',' + int.substr( int.length - 3 ,int.length) ; // input 2351 = 2,351
        }

        dec = numSplit[1];

        //You cna wrap it in the return fucntion as its gonna be less space
        return (type === 'exp' ? sign = '-' : sign = '+') + ' '+ int +'.'+ dec;
    };

    var nodelistForEach =function(list, callback){
        for (var i =0 ;i < list.length;i++){
           //so the List[i] is basically our current element and i is the index
            callback(list[i],i);
        }
    };

    return {
        getinput : function () {
            return{
                 type :document.querySelector(DOMstrings.inputType).value, //will eiuther be inc or dec
                 description :document.querySelector(DOMstrings.inputDescription).value,
                 value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem : function(obj,type){
            var html,newHtml,element;
            //Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer; 
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
           
        console.log(element);
           
            //Replace Placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml =  newHtml.replace('%value%',formatNumber(obj.value,type));


            //Insert the HTML into the DOM
           
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
          
        },

        deleteListItem:function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },
        clearFields: function(){
            var fields,fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current,index,array){
                current.value='';
            });
            fieldsArr[0].focus();
        },

        displayBudget: function (obj){
            obj.Budget > 0 ? type='inc': type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber (obj.budget,);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExpenses,'exp') ;
            
            if(obj.percentage > 0 ){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%' ;
            }
            else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '--'
            }
        },
        displayPercentages : function(percentages){

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            //Its a node list not an array  
           

            nodelistForEach(fields,function(current,index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }
                else{
                    current.textContent ='--';
                }
                }
            )


        },
        
        displayMonth: function(){
            var year, now,month,months;
            now = new Date();
            year = now.getFullYear();
            
            months = ['January','Febraury','March','April','May','June','August','September','October','November','December'];

            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month - 1] + ' ' + year;

        
        },
        
        changedType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ','+
                DOMstrings.inputDescription+','+
                DOMstrings.inputValue
            );
//aS IT RETURNS A NODE LIST we have to use foreach node list function
                nodelistForEach(fields,function(cur){
                    cur.classList.toggle('red-focus');
                });
                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
        
    }
})();

 //GLOBAL APP CONTROLLER
var AppController = (function(budgetCtrl,UICtrl){
    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        
        document.addEventListener('keypress',function(event){
            
            //keycode(like a digit asigned to each word on the keyboard) is for newer browser and which is for older browsers
            
            if(event.keyCode === 13 || event.which === 13){
            
                ctrlAddItem();
            
            }
            
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem)

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function(){
        
        //1. Calculate the Budget
        budgetCtrl.calculateBudget();
        //2 Return The Budget
        var budget = budgetCtrl.getBudget();
        //3.Show the Budget
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function () {
    
        //1.Calculate percentages
        budgetCtrl.calculatePercentages();
        //2.Read the percentages from the budget contorller
        var percentages =budgetCtrl.getPercentages();
        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    },



  ctrlAddItem = function () {
        var input,newItem;
        // 1.Get the Input data
        input= UICtrl.getinput();
        
        if(input.description !== '' && !isNaN(input.value) && input.value > 0 ){
        //2. Add the item to the budgetcontroller
        newItem = budgetCtrl.addItem(input.type , input.description , input.value);
        console.log(input.type);
        //3. Add the new item to the Ui
        UICtrl.addListItem(newItem, input.type);
        // 4. For clearing the fields
        UICtrl.clearFields();
        
        //5. Calculate and Update Budget
        updateBudget();
        //6. Calculate and update percentages
            updatePercentages();
        }

    }


    var ctrlDeleteItem= function (event) {
        var itemId,splitID,type,ID;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;   
        if(itemId){

            //inc-1 we need to split this up
            //In JS all strings have access to the Split method Js automatically puts a wrapper on them and turns them from primitive to object

            splitID = itemId.split('-');
            type = splitID[0];
            //Gets converted to a string soo has issues 
            ID = parseInt(splitID[1]);

            //1. Delete the item form the data structure
            budgetCtrl.deleteItem(type,ID);
            //2. Delete the item form the UI
            //we pass item id as the whole id is needed
            UICtrl.deleteListItem(itemId);
            //3. Update and show the new Budget
            updateBudget();
            //4. Calculate and update percentages
            updatePercentages();
        }
    }

    return{
        init : function(){
            console.log('Application has started. ');
           UICtrl.displayMonth();
            UICtrl.displayBudget(
                {
                    budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: '---'
                }
            );
            setupEventListeners();

        }
    }
   

})(budgetController,UIController);

AppController.init();