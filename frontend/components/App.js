import Order from './Order';
import AppModel from '../model/AppModel';

export default class App {
    #stock = [];  // каталог (массив объектов)
    /*
    stock
		medName 
		medCount
		medRecipeFlag
    */
    #orders = []; // заказы (массив экземпляров класса Order)


    showOrHideForm = (event) => {
        if (event.target.checked) {
            document.getElementById('order-creator-form').classList.remove('hidden');
            document.getElementById('creation-block-li').classList.remove('reduced-creation-block-height');
        } else {
            document.getElementById('order-creator-form').classList.add('hidden');
            document.getElementById('creation-block-li').classList.add('reduced-creation-block-height');
        }
    };


    deleteRecipeRow = (event) => {
        event.target.parentElement.remove();
        const selects = document.querySelectorAll('select[name^="recipe-item"]');
        const buttons = document.querySelectorAll('button[id^="recipe-list-delete-btn"]');
        var index;
        for (index = 0; index < selects.length; ++index) {
            selects[index].name = `recipe-item_${index}`;
            buttons[index].id = `recipe-list-delete-btn_${index}`;
        }
    };

    
    renderNewRecipeRow = () => {
        /*
        Структура строки рецепта:
        ul
            li
                select
                button (delete)
            li
                ...
            button (add)
        */
        const recipeLength = document.getElementsByClassName('recipe-list__item').length;
        const addBtn = document.getElementById('recipe-add-btn');
        
        const newLI = document.createElement('li');
        newLI.classList.add('recipe-list__item');

        const newSelect = document.createElement('select');
        newSelect.classList.add('recipe-list__item-name');
        newSelect.name = `recipe-item_${recipeLength}`;
        newSelect.required = true;
        this.#stock.forEach(medicine => {
            if (medicine.medRecipeFlag) {
                const optionElement = document.createElement('option');
                optionElement.innerText = medicine.medName;
                newSelect.appendChild(optionElement);
            }
        });
        newLI.appendChild(newSelect);

        const newDeleteBtn = document.createElement('button');
        newDeleteBtn.classList.add('recipe-list-item__delete-btn');
        newDeleteBtn.type = 'button';
        newDeleteBtn.innerText = '✖';
        newDeleteBtn.id = `recipe-list-delete-btn_${recipeLength}`;
        newDeleteBtn.addEventListener('click', this.deleteRecipeRow);
        newLI.appendChild(newDeleteBtn);

        addBtn.parentElement.insertBefore(newLI, addBtn);
    };


    deleteListRow = (event) => {
        event.target.parentElement.remove();
        const uuidInputs = document.querySelectorAll('input[name^="med-ID"]');
        const inputs = document.querySelectorAll('input[name^="med-COUNT"]');
        const selects = document.querySelectorAll('select[name^="med-NAME"]');
        const spans = document.querySelectorAll('span[id^="med-recipe-span"]');
        var index;
        for (index = 0; index < inputs.length; ++index) {
            uuidInputs[index].name = `med-ID_${index}`;
            inputs[index].name = `med-COUNT_${index}`;
            selects[index].name = `med-NAME_${index}`;
            spans[index].id = `med-recipe-span_${index}`;
        }
    };


    renderNewListRow = () => {
        /*
        Структура строки списка лекарств
        ul
            li
                input (hidden)
                div (name)
                    h3
                    select
                div (count)
                    h3
                    input (number)
                div (recipe)
                    h3
                    span
                button (delete)
            li
                ...
            button (add)
        */
        const listLength = document.querySelectorAll('span[id^="med-recipe-span"]').length;
        const addBtn = document.getElementById('med-list-item-add-btn');

        const newLI = document.createElement('li');
        newLI.classList.add('medicine-list__item');

        const inputUuidElement = document.createElement('input');
        inputUuidElement.type = 'hidden';
        inputUuidElement.value = crypto.randomUUID();
        inputUuidElement.name = `med-ID_${listLength}`;
        newLI.appendChild(inputUuidElement);

        const divMedName = document.createElement('div');
        divMedName.classList.add('medicine-desc-part-name');
        newLI.appendChild(divMedName);

        const labelMedName = document.createElement('label');
        labelMedName.innerText = 'Название';
        divMedName.appendChild(labelMedName);

        const selectMedName = document.createElement('select');
        selectMedName.classList.add('medicine-list__item-name');
        selectMedName.name = `med-NAME_${listLength}`;
        selectMedName.required = true;
        this.#stock.forEach(medicine => {
            const optionElement = document.createElement('option');
            optionElement.innerText = medicine.medName;
            selectMedName.appendChild(optionElement);
        });
        selectMedName.addEventListener('change', (event) => {
            const num = event.target.name.split('_')[1];
            const recipe_required = this.#stock.filter((medicine) => medicine.medName == event.target.value)[0].medRecipeFlag;
            document.getElementById(`med-recipe-span_${num}`).innerText = (
                recipe_required? '✔' : '✖'
            );
        });
        divMedName.appendChild(selectMedName);

        const divMedCount = document.createElement('div');
        divMedCount.classList.add('medicine-desc-part-count');
        newLI.appendChild(divMedCount);

        const labelMedCount = document.createElement('label');
        labelMedCount.innerText = 'Количество';
        divMedCount.appendChild(labelMedCount);

        const inputMedCount = document.createElement('input');
        inputMedCount.classList.add('form-block__input-field');
        inputMedCount.type = 'number';
        inputMedCount.min = 1;
        inputMedCount.value = 1;
        inputMedCount.name = `med-COUNT_${listLength}`;
        divMedCount.appendChild(inputMedCount);

        const divMedRecipe = document.createElement('div');
        divMedRecipe.classList.add('medicine-desc-part-recipe');
        newLI.appendChild(divMedRecipe);

        const labelMedRecipe = document.createElement('label');
        labelMedRecipe.innerText = 'Требует рецепт?';
        divMedRecipe.appendChild(labelMedRecipe);

        const spanMedRecipe = document.createElement('span');
        spanMedRecipe.innerText = (this.#stock[0].medRecipeFlag ? '✔' : '✖');
        spanMedRecipe.id = `med-recipe-span_${listLength}`;
        divMedRecipe.appendChild(spanMedRecipe);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('medicine-list-item__delete-btn');
        deleteBtn.innerText = '✖';
        deleteBtn.type = 'button';
        deleteBtn.addEventListener('click', this.deleteListRow);
        newLI.appendChild(deleteBtn);

        addBtn.parentElement.insertBefore(newLI, addBtn);
    };


    formExecuter = async (event) => {
        event.preventDefault();
        const shouldFormBeSended = confirm('Сейчас ты собираешься отправить форму. Продолжить?');
        if (!shouldFormBeSended) return;

        const elems = event.target.elements;
        var index; // для цикла со счётчиком
        var iname; // имя полей формы
        var cycleBreak = false; // прерываем, если обнаружили неправильности
        var orderIsUnderChange = false; // true при изменении заказа
        var sendable = {  // это мы отправим обрабатываться в БД
            order_id: null,
            fio: null,
            date_until: null,
            lists: []
        };
        var recipe = []; // что у нас в рецепте
        var updateCountable = []; // на какие значения меняем количества в складе
        var filterable; // результаты фильтра
        var orderStockForChange = []; // имя и количество на складе, если мы меняем заказ

        for (index = 0; index < elems.length; ++index) {
            iname = elems[index].name;
            if (iname !== '') {
                iname = iname.split('_');
                switch(iname[0]) {
                    case 'order-ID':
                        sendable.order_id = elems[index].value;
                        if (sendable.order_id !== '0') orderIsUnderChange = true;
                        break;
                    case 'order-FIO':
                        if (elems[index].value.split(' ').length == 3) {
                            sendable.fio = elems[index].value;
                        } else {
                            alert('ФИО должно писаться в 3 слова, разделяемые пробелами!');
                            cycleBreak = true;
                        }
                        break;
                    case 'order-DATE':
                        const comparable = new Date(elems[index].value);
                        const arr_date = document.getElementById('date-display').textContent.split('.');
                        const dt = new Date(arr_date[2] + '-' + arr_date[1] + '-' + arr_date[0]);
                        if (comparable < dt) {
                            alert('Выбранная дата доставки заказа в прошлом! Путешествие во времени мы не изобрели...');
                            cycleBreak = true;
                        } else {
                            sendable.date_until = elems[index].value;
                        }
                        break;
                    case 'recipe-item':
                        filterable = this.#stock.filter((medicine) => medicine.medName == elems[index].value);
                        if (filterable.length > 0) {
                            if (filterable[0].medRecipeFlag) {
                                recipe.push(elems[index].value);
                            } else {
                                alert('Ай-яй-яй! Какой плохой пользователь! Пожалуйста, не ломай систему!')
                                cycleBreak = true;
                            }
                        } else {
                            alert('Ай-яй-яй! Какой плохой пользователь! Пожалуйста, не ломай систему!')
                            cycleBreak = true;
                        }
                        break;
                    case 'med-ID':
                        // будет использоваться в case med-NAME
                        break;
                    case 'med-NAME':
                        filterable = sendable.lists.filter((medicine) => medicine.med_name == elems[index].value);
                        if (filterable.length > 0) {
                            alert(`${elems[index].value} уже есть в списке заказов. Дублировать лекарства нельзя!`);
                            cycleBreak = true;
                        } else {
                            filterable = this.#stock.filter((medicine) => medicine.medName == elems[index].value);
                            if (filterable.length > 0) {
                                if (filterable[0].medRecipeFlag) {
                                    if (recipe.includes(filterable[0].medName)) {
                                        sendable.lists.push({
                                            id: elems[index-1].value,
                                            med_name: elems[index].value,
                                            count: null
                                        });
                                        updateCountable.push({
                                            name: elems[index].value,
                                            delta: null
                                        });
                                    } else {
                                        alert(`Тебе нужен рецепт для заказа ${elems[index].value}`);
                                        cycleBreak = true;
                                    }
                                } else {
                                    sendable.lists.push({
                                        id: crypto.randomUUID(),
                                        med_name: elems[index].value,
                                        count: null
                                    });
                                    updateCountable.push({
                                        name: elems[index].value,
                                        delta: null
                                    });
                                }
                            } else {
                                alert('Ай-яй-яй! Какой плохой пользователь! Пожалуйста, не ломай систему!')
                                cycleBreak = true;
                            }
                        }
                        break;
                    case 'med-COUNT':
                        if (filterable[0].medCount >= Number(elems[index].value)) {
                            sendable.lists.at(-1).count = Number(elems[index].value);
                            updateCountable.at(-1).delta = sendable.lists.at(-1).count * (-1);
                        } else {
                            if (!orderIsUnderChange) {
                                alert(`На складе не так много лекарства под названием "${filterable[0].medName}"... Сейчас там ${filterable[0].medCount} шт.`);
                                cycleBreak = true;
                            }
                        }
                        if (orderIsUnderChange) {
                            sendable.lists.at(-1).count = Number(elems[index].value);
                            orderStockForChange.push({
                                name: filterable[0].medName,
                                count: filterable[0].medCount
                            });
                        }
                        break;
                    default:
                        if (iname[0] !== '') {
                            alert('Ай-яй-яй! Какой плохой пользователь! Пожалуйста, не ломай систему!')
                            cycleBreak = true;
                        }
                        break;
                }
            }
            if (cycleBreak) {
                break;
            }
        }
        if (!cycleBreak) {
            // обработать и послать
            if (sendable.lists.length > 0) {
                if (!orderIsUnderChange) {
                    sendable.order_id = crypto.randomUUID();
                    await AppModel.addOrder(sendable);
                    await AppModel.updateStock(updateCountable);
                } else {
                    await this.#orders.filter((order) => order.orderID == sendable.order_id)[0].sendChangesToDB(sendable, orderStockForChange);
                }
                document.location.reload();
            } else {
                alert('Надо хотя бы что-то в заказ включить...');
            }
        }
    };


    formCleaner = () => {
        document.querySelector('h2[class="form-label"]').innerText = 'Создание заказа';
        document.querySelector('input[name=order-ID]').value = '0';
        document.querySelector('input[name=order-FIO]').value = '';
        document.querySelector('input[name=order-DATE]').value = '';
        const recipeParent = document.querySelector('.form-block__recipe-list');
        while (recipeParent.firstChild.tagName !== 'BUTTON') {
            recipeParent.firstChild.remove();
        }
        const listParent = document.querySelector('.form-block__medicine-list');
        while (listParent.firstChild.tagName !== 'BUTTON') {
            listParent.firstChild.remove();
        }
    };


    onEditOrder = ({ orderID, orderUser, orderDate, medicines }) => {
        this.formCleaner();
        document.querySelector('h2[class="form-label"]').innerText = 'ИЗМЕНЕНИЕ заказа';
        document.querySelector('input[name="order-ID"]').value = orderID;
        document.querySelector('input[name="order-FIO"]').value = orderUser;
        const dateConverted = new Date(orderDate);
        document.querySelector('input[name="order-DATE"]').value = 
            `${
                dateConverted.getFullYear()
            }-${
                (dateConverted.getMonth()+1 < 10 ? 0 : '')
                }${
                dateConverted.getMonth()+1
            }-${
                (dateConverted.getDate() < 10 ? 0 : '')
                }${
                dateConverted.getDate()
            }`;

        alert('Загляните в форму создания заказа, она чуть изменилась OwO. Кнопка сброса вернёт форму к созданию!');
        
        var medRecipeNamesArray = [];
        medicines.map((med) => medRecipeNamesArray.push(med.listMedName));

        const recipeAddBtn = document.getElementById('recipe-add-btn');
        var recipeDeleteBtn;
        const listAddBtn = document.getElementById('med-list-item-add-btn');
        var listSelectElem;

        var index, recipeIndex;
        for (index = 0, recipeIndex = 0; index < medicines.length; ++index, ++recipeIndex) {
            recipeAddBtn.click();
            listSelectElem = document.querySelector(`select[name="recipe-item_${recipeIndex}"]`);
            listSelectElem.value = medicines[index].listMedName;
            if (!listSelectElem.value) { // если запихнутого value в списке нет, то value будет пустым
                recipeDeleteBtn = document.getElementById(`recipe-list-delete-btn_${recipeIndex}`);
                recipeDeleteBtn.click();
                recipeIndex -= 1;
            }
            listAddBtn.click();
            document.querySelector(`select[name="med-NAME_${index}"]`).value = medicines[index].listMedName;
            document.querySelector(`input[name="med-COUNT_${index}"]`).value = medicines[index].listCount;
            document.querySelector(`select[name="med-NAME_${index}"]`).dispatchEvent(new Event('change')); // триггернуть ивент
        }
    };


    redrawTable = (updateCountable) => {
        const tableElement = document.querySelector('.stock-table');
        var iRow;
        for (iRow = 1; iRow < tableElement.rows.length; ++iRow) {
            tableElement.rows[iRow].cells[0].innerText = this.#stock[iRow-1].medName;
            tableElement.rows[iRow].cells[1].innerText = `${this.#stock[iRow-1].medCount} шт.`;
            tableElement.rows[iRow].cells[2].innerText = `+${updateCountable[iRow-1].delta}`;
        }
    };


    onPushHeaderDate = async (delta) => {
        const dateStringArray = localStorage.getItem('currentDate').split('.');
        var dateNow = new Date(`${dateStringArray[2]}-${dateStringArray[1]}-${dateStringArray[0]}`);
        dateNow.setDate(dateNow.getDate() + delta);
        document.getElementById('date-display').innerText = dateNow.toLocaleDateString();

        localStorage.setItem('currentDate', dateNow.toLocaleDateString());

        if (delta > 0) {
            await Promise.all(this.#orders.map((ord) => ord.checkForDateDeletion()));

            var updateCountable = [];
            this.#stock.map((stockStr) => updateCountable.push({
                name: stockStr.medName, 
                delta: Math.floor(Math.random() * 3)
            }));

            await AppModel.updateStock(updateCountable);
            this.#stock = await AppModel.getStock();
            
            this.redrawTable(updateCountable);
        }
    };


    renderStockTable = () => {
        const beforeElement = document.querySelector('ul[class="orderlist"]');

        const tableElement = document.createElement('table');
        tableElement.classList.add('stock-table');

        const rowHeadElement = document.createElement('tr');
        rowHeadElement.classList.add('stock-table__head-row');
        tableElement.appendChild(rowHeadElement);

        const headMedName = document.createElement('th');
        headMedName.innerText = 'Название лекарства';
        rowHeadElement.appendChild(headMedName);
        const headMedCount = document.createElement('th');
        headMedCount.innerText = 'Количество';
        rowHeadElement.appendChild(headMedCount);
        const headMedDelta = document.createElement('th');
        headMedDelta.innerText = 'Поставка';
        rowHeadElement.appendChild(headMedDelta);

        this.#stock.forEach((stockObj) => {
            const rowDataElement = document.createElement('tr');
            rowDataElement.classList.add('stock-table__common-row');
            tableElement.appendChild(rowDataElement);

            const rowMedName = document.createElement('td');
            rowMedName.innerText = stockObj.medName;
            rowDataElement.appendChild(rowMedName);
            const rowMedCount = document.createElement('td');
            rowMedCount.innerText = `${stockObj.medCount} шт.`;
            rowDataElement.appendChild(rowMedCount)
            const rowMedDelta = document.createElement('td');
            rowMedDelta.innerText = `+0`;
            rowDataElement.appendChild(rowMedDelta);
        });

        beforeElement.parentElement.insertBefore(tableElement, beforeElement);
    };


    async init() {
        const currentDate = (localStorage.getItem('currentDate') !== null ? localStorage.getItem('currentDate') : '01.02.2024');
        localStorage.setItem('currentDate', currentDate);
        document.getElementById('date-display').innerText = currentDate;

        // реакция на переключение даты
        document.getElementById('date-forwards-btn')
            .addEventListener('click', () => this.onPushHeaderDate(1));
        document.getElementById('date-backwards-btn')
            .addEventListener('click', () => this.onPushHeaderDate(-1));

        // реакция на скрытие-показ формы
        document.getElementById('form-visible-switch')
            .addEventListener('change', this.showOrHideForm);
        
        // (форма) реакция на подтверждение
        const formElement = document.getElementById('order-creator-form');
        formElement.addEventListener('submit', this.formExecuter);

        // (форма) реакция на добавление строчки в рецепте
        document.getElementById('recipe-add-btn')
            .addEventListener('click', this.renderNewRecipeRow);

        // (форма) реакция на добавление строчки в списке лекарств
        document.getElementById('med-list-item-add-btn')
            .addEventListener('click', this.renderNewListRow);

        // (форма) реакция на нажатие очистки формы
        document.getElementById('order-FORM-RESET')
            .addEventListener('click', this.formCleaner);

        try {
            this.#stock = await AppModel.getStock();
            
            const orders = await AppModel.getOrders();

            orders.forEach(order => this.#orders.push(new Order(order, {
                onEditOrder: this.onEditOrder
            })));
        } catch (error) {
            console.error(error);
        }
        this.renderStockTable();
    }
}