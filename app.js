// BUDGET CONTROLLER
const budgetController = (function() {

    const Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalInc) {
        if(totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        } else {
            this.percentage = -1;
        }     
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const calculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach((current) => {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    const data = {
        allItems: {
            exp: [],    // inside array object expense(id,description,value)
            inc: []     // inside array object income(id,description,value)
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type, des, val) {
            let newItem, ID;

            // [1 2 3 4 5], next ID = 6
            // [1 2 4 6 8], next ID = 9
            // ID = last ID + 1

            // Create new ID
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push it into our data Structure
            data.allItems[type].push(newItem);

            return newItem;
        },

        deleteItem: function(type, id) {
            // [1 2 4 6 8]
            // remove = 4 -> [1 2 6 8]
            
            let index = data.allItems[type].findIndex((element) => {
                return element.id === id;
            });

            if (index !== -1) {
                data.allItems[type].splice(index,1);
            }
        },

        calculateBudget: function() {
            // 1. calcalcute inc & exp
            calculateTotal('exp');
            calculateTotal('inc')

            //2. calcalcute the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //3. calcalcute percentage which spend
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);    
            } else {
                data.percentage = -1;
            }  
        },

        calcalcutePercentages: function() {
            /*
                a=20
                b=10
                c=40
                income = 100
                a = 20/100=20%
                b = 10/100=10% 
                c = 40/100=40% 
            */

            data.allItems.exp.forEach(cur => {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            let allPerc = data.allItems.exp.map(cur => {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
    }

})();

// UI CONTROLLER
const UIController = (function() {
    
    const DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    const formatNumber = function(num, type) {
        let numSplit, int, dec;
        /*
         + or - before number
         exactly 2 decimal points
         comma separating the thousands

         2310.4567 -> + 2,310.46
         2000 -> + 2,000.00
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length -3, 3); // 25320 -> 25,320
        }
        
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + ' . ' + dec;
    }

    function nodeListForEach(list, callback) {
        for(i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    }

    return {
        getInput: function() {
            return  {
                type: document.querySelector(DOMstrings.inputType).value, // output inc or either exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            let html, newHtml, element;

            // Create html element string with placeholder text
            if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = `
                        <div class="item clearfix" id="exp-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">%value%</div>
                                <div class="item__percentage">21%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn">
                                        <i class="icon ion-md-close"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ` ;
            } else if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = `
                        <div class="item clearfix" id="inc-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">%value%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn">
                                        <i class="icon ion-md-close"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));

            // Insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },    
        
        deleteListItem: function(selectorID) {
            // remove child element by their selectorID parent ->  child => parentNode => child (remove) 
            let el = document.getElementById(selectorID);
                el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldArr;

            fields = document.querySelectorAll(`${DOMstrings.inputDescription},${DOMstrings.inputValue}`);

            fieldArr = Array.from(fields);

            fieldArr.forEach(current => {
                current.value = '';
            });

            fieldArr[0].focus();
        },

        displayBudget: function(obj) {
            
            let type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '--';
            }

        },

        displayPercentages: function(percentages) {
            
            let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, (current, index) => {
                
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '--';
                }

            });

        },

        displayMonth: function() {
            let now, months, month, year;

            now = new Date();
            // let christmas = new Date(2019, 11, 25);

            months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Augest', 'September', 'October', 'November', 'December'];

            month = now.getMonth();

            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' '+year;
        },

        changeType: function(event) {
            // seperate by comma , with concatenation
            let fields = document.querySelectorAll(
                DOMstrings.inputType + ','+
                DOMstrings.inputDescription + ','+
                DOMstrings.inputValue);
            
            nodeListForEach(fields, cur => {
                cur.classList.toggle('red-focus');
            });

            // ES6
            // Array.from(fields).forEach(cur => {
            //     cur.classList.toggle('red-focus');
            // });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    }

})();

// GLOBAL APP CONTROLLER
const controller = (function(budgetCtrl, UICtrl) {

    const setupEventListerners = function() {
        let DOM = UICtrl.getDOMstrings();

        // Click on button
        document.querySelector('.add__btn').addEventListener('click', ctrlAddItem);
    
        // Enter keyword
        document.addEventListener('keypress', function(event){
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);

    };

    const updateBudget = function() {

        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        const budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    const updatePercentages = function() {

        //1. Calculate Percentages
        budgetCtrl.calcalcutePercentages();

        //2. Read percentages from the budget controller
        let percentages = budgetCtrl.getPercentages();

        //3. update the ui with the new percentages
        UICtrl.displayPercentages(percentages);

    };

    const ctrlAddItem = function() {
        let input, newItem;
        
            //1. Get Input value
            input = UICtrl.getInput();

            if (input.description !== '' && !isNaN(input.value) && input.value > 0 ) {

            //2. Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to ui
            UICtrl.addListItem(newItem,input.type);

            //4. Clear the fields
            UICtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();

            //6. Calculate and update percentages
            updatePercentages();

        }
    }

    const ctrlDeleteItem = function(event) {
         
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //1. Delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            //2. Remove item from UI
            UICtrl.deleteListItem(itemID);

            //3. calculate & update budget
            updateBudget();

            //4. Calculate and update percentages
            updatePercentages();

        }
    }

    return {
        init: function() {
            console.log('Application started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListerners();

        }
    }
})(budgetController, UIController);

controller.init();