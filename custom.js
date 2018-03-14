var enjoyCalendar = (function () {

    var $enjoyCalendar = $('#enjoy-calendar');

    var state = {
        viewName:'DEFAULT',
    }

    function setViewName(name) {
        state.viewName = name;
    }

    function getViewName() {
        return state.viewName;
    }

    function setState(state,slots) {

        switch(state) {
            case 'DEFAULT':


                $enjoyCalendar.html('DEFAULT STATE');
                break;
            case 'OPEN':


                $enjoyCalendar.html('OPEN STATE');
                break;
            case 'CLOSED':

                $enjoyCalendar.html('CLOSED STATE');
                break;
        }

        setViewName(state);

    }

    return {
        getViewName:getViewName,
        setViewName:setViewName,
        setState:setState,
    }
})();


function generateRandomSlots() {

    var slots = [];

    for (var i=0; i < 12; i++) {
        slots.push(++i);
    }

    return slots;
}

var constants = {
    billingInputSelector:'#input-address-1',
    deliveryInputSelector:'#input-address-2',
    anotherInputSelector:'#input-address-3',
}

var checkoutContext = {
    activeAddress:null,
    deliveryMethod:null,
    enjoyConfirmedSlot:null,
    enjoyStore:[],
}

function updateContext(prop,value) {

    switch (prop) {
        case 'activeAddress':

            checkoutContext.activeAddress = value;

            break;
        case 'deliveryMethod':

            checkoutContext.deliveryMethod = value;

            break;
        case 'enjoyConfirmedSlot':

            checkoutContext.enjoyConfirmedSlot = value;

            break;

        case 'enjoyStore':

            checkoutContext.enjoyStore.push(value);

            break;

    }

    console.log('context was updated',checkoutContext);

}

var addressesArray = [
    {
        address: null,
        type: 'billing',
        active: false,
        expressStatus: true
    },
    {
        address: null,
        type: 'delivery',
        active: false,
        expressStatus: false
    },
    {
        address: null,
        type: 'another',
        active: false,
        expressStatus: true,
    },
    {
        address: 'Store address',
        type: 'store',
        active: false,
        expressStatus: 'store',
    }
];

function populateAddress(type) {

    var address;

    switch (type) {
        case 'billing':

            address = $(constants.billingInputSelector).val().trim();

            break;
        case 'delivery':

            address = $(constants.deliveryInputSelector).val().trim();

            break;
        case 'another':

            address = $(constants.anotherInputSelector).val().trim();

            break;
    }

    addressesArray.forEach(function(item) {
        if (item.type === type) {
            item.address = address;
        }
    })

    console.log(addressesArray);

}

function getActiveAddress() {

    var activeAddress;

    addressesArray.forEach(function(item) {
        if (item.active === true) {
            activeAddress = item;
        }
    })

    return activeAddress;
}

function setActiveAddress(type) {

    var activeAddress;

    addressesArray.forEach(function(item) {
        if (item.type === type) {
            item.active = true;
            activeAddress = item;
        } else {
            item.active = false;
        }
    })

    console.log('Active address changed');

    updateContext('activeAddress',activeAddress);
    refreshDeliveryTypeOptions();
    return activeAddress;
}

function getAddressContext(address) {

    var context;

    checkoutContext.enjoyStore.forEach(function(item) {
        if (item.address === address) {
            context = item;
        }
    })

    return context;

}

function createAddressContext(address) {

    var products = [1,2,3];
    var eligibility;
    var slots;
    var postcode = null;

    eligibility = checkEligibility(address);
    slots = generateRandomSlots(postcode);

    var context = {
        address:address,
        products:products,
        eligibility:eligibility,
        slots:slots
    };

    updateContext('enjoyStore', context);

    return context;

}

function refreshDeliveryTypeOptions () {

    var address = getActiveAddress();

    var addressContext = getAddressContext(address);

    if (!addressContext) {
        addressContext = createAddressContext(address)
    }


    switch(addressContext.eligibility) {
        case true:
            showDeliveryTypesBlock();
            enableExpressDeliveryMethod();
            enableStandardDeliveryMethod();
            enjoyCalendar.setState('DEFAULT');
            break;
        case false:
            showDeliveryTypesBlock();
            disableExpressDeliveryMethod();
            enableStandardDeliveryMethod();
            selectStandardDelivery();
            enjoyCalendar.setState('DEFAULT');
            break;
        case 'store':
            disableExpressDeliveryMethod();
            disableStandardDeliveryMethod();
            hideDeliveryTypesBlock();
            enjoyCalendar.setState('DEFAULT');
            break;
    }
}



function checkEligibility() {
    var currentActiveAddress = getActiveAddress();
    return currentActiveAddress.expressStatus
}

populateAddress('billing');
populateAddress('delivery');
populateAddress('another');

setActiveAddress('delivery');

//-------------------

$(constants.billingInputSelector).change(function(e) {
    populateAddress('billing');
});

$(constants.deliveryInputSelector).change(function(e) {
    populateAddress('delivery');
});

$(constants.anotherInputSelector).change(function(e) {
    populateAddress('another');
});

//-------------------

$('#select-delivery-address').change(function(e) {
    setActiveAddress('delivery');
});

$('#select-another-address').change(function(e) {
    setActiveAddress('another');
});

$('#select-store-address').change(function(e) {
    setActiveAddress('store');
});

//-------------------

function selectStandardDelivery() {
    $('#select-standard-delivery-method').prop('checked', true);
}

function selectExpressDelivery() {
    $('#select-express-delivery-method').prop('checked', true);
}

function setDeliveryMethod(deliveryMethod) {

    switch (deliveryMethod) {
        case 'standard':

            selectStandardDelivery();
            updateContext('deliveryMethod','standard');
            break;

        case 'express':

            selectExpressDelivery();
            updateContext('deliveryMethod','express');
            break;
    }

    console.log('Delivery method changed');

}

$('#select-express-delivery-method').change(function(e) {
    e.preventDefault();

    var activeAddress = getActiveAddress();
    var productsInCart = [1,2,3];
    var slotsFormMemory = getSlotsFromContext(activeAddress);
    var slots;

    if (slotsFormMemory) {
        slots = slotsFormMemory;
    } else {
        slots = getSlotsForThisAddress(activeAddress);
    }

    console.log('render slots',slots);

    switch(enjoyCalendar.getViewName()) {
        case 'OPEN':
            enjoyCalendar.setState('CLOSED',slots);
            break;
        case 'CLOSED':
            enjoyCalendar.setState('OPEN',slots);
            break;
        case 'DEFAULT':
            enjoyCalendar.setState('OPEN',slots);
            break;
    }

    setDeliveryMethod('express');
});

function getSlotsFromContext(activeAddress) {

    var enjoySlots;

    checkoutContext.enjoyStore.forEach(function(item) {
        if (item.address === activeAddress) {
            enjoySlots = item.slots;
        }
    })

    return enjoySlots;


}

function getSlotsForThisAddress(activeAddress) {
    var enjoySlots;

    enjoySlots = generateRandomSlots();

    var o = {
        slots: enjoySlots,
        address: Object.assign({},activeAddress),
        confirmedSlot: null
    };

    updateContext('enjoyStore', o);

    return enjoySlots;
}

$('#select-standard-delivery-method').change(function(e) {
    e.preventDefault();

    switch(enjoyCalendar.getViewName()) {
        case 'OPEN':
            enjoyCalendar.setState('CLOSED');
            break;
        case 'CLOSED':
            enjoyCalendar.setState('CLOSED');
            break;
        case 'DEFAULT':
            enjoyCalendar.setState('DEFAULT');
            break;
    }

    setDeliveryMethod('standard')
});


function enableExpressDeliveryMethod() {
    $('#select-express-delivery-method').closest('.delivery-type').css({'opacity': '1'})
}

function disableExpressDeliveryMethod() {
    $('#select-express-delivery-method').closest('.delivery-type').css({'opacity': '.1'})
}

function disableStandardDeliveryMethod() {
    $('#select-standard-delivery-method').closest('.delivery-type').css({'opacity': '.1'})
}

function enableStandardDeliveryMethod() {
    $('#select-standard-delivery-method').closest('.delivery-type').css({'opacity': '1'})
}

function hideDeliveryTypesBlock() {
    $('.choose-delivery-type').hide();
}

function showDeliveryTypesBlock() {
    $('.choose-delivery-type').show();
}

function defaultBehaviour() {
    $('#select-delivery-address').attr('checked',true);
}

defaultBehaviour();