//constraints which are applied on the form field
let constraints = {
    name: {
        presence: true,
        length: {
            minimum: 2,
            maximum: 50
        }
    },
    address: {
        presence: true,
        length: {
            minimum: 5,
            maximum: 50
        }
    },
    email: {
        presence: true,
        email: true
    },
    city:{
        presence: true
    },
    state:{
        presence: true,
    },
    postalCode:{
        presence: true
    },
    country:{
        presence: true
    }


};

var inputs = document.querySelectorAll("form#jobsForm input.form-control, textarea, select.form-control");
inputs.forEach(input => {
    input.addEventListener("change", function (ev) {
        var errors = validate(form, constraints) || {};
        showErrorsForInput(this, errors[this.name])
    });
}
)


var form = document.querySelector("form#jobsForm");
form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    handleFormSubmit(form);
});

//it handles the form submit
function handleFormSubmit(form, input) {
    // validate the form against the constraints
    var errors = validate(form, constraints);
    // then we update the form to reflect the results
    showErrors(form, errors || {});
    if (!errors) {
        showSuccess();
    } else {
        Swal.fire({
            title: "Form Error",
            text: "Please ensure all fields are correct!",
            icon: "error",
            confirmButtonText: "Ok",
        })
    }
}

function showErrors(form, errors) {
    // We loop through all the inputs and show the errors for that input
    form.querySelectorAll("input.form-control, select.form-control").forEach(function (input) {
        showErrorsForInput(input, errors && errors[input.name]);
    });
}

function showErrorsForInput(input, errors) {
    var formGroup = input.parentNode;
    resetFormGroup(formGroup, input);
    if (errors) {
        formGroup.classList.add("has-error");
        input.setAttribute("aria-invalid", "true");
        errors.forEach(function (error, index) {
            addError(formGroup, error, input, index);
        });
    } else {
        formGroup.classList.add("has-success");
        input.removeAttribute("aria-invalid");
    }
}

// Recusively finds the closest parent that has the specified class
function closestParent(child, className) {
    if (!child || child == document) {
        return null;
    }
    if (child.classList.contains(className)) {
        return child;
    } else {
        return closestParent(child.parentNode, className);
    }
}

// function to remove errors from the form
function resetFormGroup(formGroup, input) {
    formGroup.classList.remove("has-error");
    formGroup.classList.remove("has-success");
    formGroup.querySelectorAll(".custom-error").forEach(function (el) {
        el.remove();
    });
    if (input) {
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
    }
}

//logic to add error into the form
function addError(formGroup, error, input, index) {
    let errorMessage = document.createElement('small');
    // errorMessage.style.position = 'absolute';
    errorMessage.style.color = '#ea205a';
    errorMessage.innerText = error;
    errorMessage.classList.add('custom-error');
    // role="alert" so a screen reader announces the message as it's
    // inserted, and aria-describedby ties it to the field that failed
    // (jQuery-Validation-style wiring, applied by hand since this form
    // uses the standalone validate.js library instead).
    errorMessage.setAttribute('role', 'alert');
    var errorId = (input.id || input.name) + '-error-' + index;
    errorMessage.id = errorId;
    var describedBy = input.getAttribute('aria-describedby');
    input.setAttribute('aria-describedby', describedBy ? describedBy + ' ' + errorId : errorId);
    let isSelect = formGroup.querySelector('.tg-select');
    if (isSelect) {
        errorMessage.classList.add('select')
        isSelect.appendChild(errorMessage);
    } else {
        formGroup.appendChild(errorMessage);
    }
}

//function to reset the form
function resetForm() {
    document.querySelectorAll('div.mb-3.has-success').forEach(formGroup => {
        formGroup.classList.remove('has-success');
    })
    document.querySelectorAll('#jobsForm input.form-control, select.form-control, textarea').forEach(input => {
        input.value = '';
    })
}


// this function handles success if form is valid
function showSuccess() {
    grecaptcha.ready(function () {
        grecaptcha.execute("6LcHIYcUAAAAAPnqH0iBwnDeFma0mWAMJKJHAoEO").then(function (token) {
            document.querySelector('input[name=token]').value = token;
            var formEl = document.querySelector('form#jobsForm');
            var body = new URLSearchParams(new FormData(formEl));
            fetch(formEl.getAttribute('action'), {
                method: formEl.getAttribute('method') || 'POST',
                body: body
            }).then(function (response) {
                if (response.status === 200) {
                    Swal.fire({
                        title: "Thank You!",
                        icon: "success",
                        confirmButtonText: 'Ok'
                    });
                    resetForm();
                } else {
                    Swal.fire({
                        title: "Some Error Occurred!",
                        icon: "error",
                        confirmButtonText: 'Ok'
                    });
                }
            }).catch(function () {
                Swal.fire({
                    title: "An unexpected Error Occurred!",
                    icon: "error",
                    confirmButtonText: 'Ok'
                });
            });
        });
    });
}

