(function () {
  "use strict";

  var config = window.NTE27_CONFIG || {};
  var standardNames = {
    Company: "company",
    FirstName: "first_name",
    LastName: "last_name",
    Email: "email",
    Phone: "phone",
    MobilePhone: "mobile",
    Title: "title",
    Website: "URL",
    Salutation: "salutation"
  };

  function setStatus(form, message, type) {
    var status = form.querySelector("[data-form-status]");
    if (!status) return;
    status.textContent = message;
    status.className = "status " + type;
    status.hidden = false;
    status.setAttribute("tabindex", "-1");
    status.focus();
  }

  function configureShell() {
    document.querySelectorAll("[data-current-year]").forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
    document.querySelectorAll('[data-config-link="terms"]').forEach(function (link) {
      if (config.termsUrl) {
        link.href = config.termsUrl;
      } else {
        link.href = "#terms-link-required";
        link.setAttribute("aria-disabled", "true");
        link.title = "The final NTE27 Terms and Conditions PDF URL is still required.";
        link.addEventListener("click", function (event) { event.preventDefault(); });
      }
    });
    document.querySelectorAll('[data-config-link="logo"]').forEach(function (link) {
      if (config.logoFileRequestUrl) {
        link.href = config.logoFileRequestUrl;
        link.removeAttribute("aria-disabled");
      } else {
        link.href = "#logo-link-required";
        link.setAttribute("aria-disabled", "true");
        link.title = "The secure upload link is not available in this review.";
        link.addEventListener("click", function (event) { event.preventDefault(); });
      }
    });
  }

  function enableConditionalSections() {
    document.querySelectorAll("[data-conditional-for]").forEach(function (target) {
      var source = document.getElementById(target.dataset.conditionalFor);
      if (!source) return;
      function sync() {
        var expected = (target.dataset.conditionalValue || "Yes").split("|");
        var value = source.type === "checkbox" ? (source.checked ? "Yes" : "No") : (source.type === "radio" ? (source.checked ? source.value : "") : source.value);
        var show = expected.indexOf(value) !== -1;
        target.hidden = !show;
        target.querySelectorAll("input, select, textarea, button").forEach(function (control) {
          control.disabled = !show;
          if (control.hasAttribute("data-required-when-visible")) control.required = show;
        });
      }
      source.addEventListener("change", sync);
      if (source.type === "radio" && source.name) {
        document.querySelectorAll('input[type="radio"][name="' + source.name + '"]').forEach(function (radio) { radio.addEventListener("change", sync); });
      }
      sync();
    });
  }

  function syncCombinedFields(form) {
    form.querySelectorAll("[data-combine-fields]").forEach(function (target) {
      var ids = target.dataset.combineFields.split(",");
      target.value = ids.map(function (id) {
        var source = document.getElementById(id.trim());
        return source ? source.value.trim() : "";
      }).filter(Boolean).join(" ");
    });
    form.querySelectorAll("[data-copy-value-from]").forEach(function (target) {
      var source = document.getElementById(target.dataset.copyValueFrom);
      target.value = source ? source.value : "";
    });
    form.querySelectorAll("[data-switch-copy]").forEach(function (target) {
      var switcher = document.getElementById(target.dataset.switchCopy);
      var sourceList = switcher && switcher.value === "No" ? target.dataset.copyWhenNo : target.dataset.copyWhenYes;
      var values = (sourceList || "").split(",").map(function (id) {
        var source = document.getElementById(id.trim());
        return source ? source.value.trim() : "";
      }).filter(Boolean);
      target.value = target.dataset.copyMode === "combine" ? values.join(" ") : (values[0] || "");
    });
  }

  function setupPackageSummary() {
    var checkboxes = Array.prototype.slice.call(document.querySelectorAll("[data-package-price]"));
    var countNode = document.querySelector("[data-package-count]");
    var totalNode = document.querySelector("[data-package-total]");
    if (!checkboxes.length || !countNode || !totalNode) return;
    function sync() {
      var selected = checkboxes.filter(function (box) { return box.checked; });
      var total = selected.reduce(function (sum, box) { var price = Number(box.dataset.packagePrice); return sum + (Number.isFinite(price) ? price : 0); }, 0);
      var hasPoa = selected.some(function (box) { return box.dataset.packagePrice === "poa"; });
      countNode.textContent = selected.length ? selected.length + " package" + (selected.length === 1 ? "" : "s") + " selected" : "No packages selected";
      totalNode.textContent = total ? "Listed-price total: " + new Intl.NumberFormat("en-GB", {style:"currency",currency:"GBP",maximumFractionDigits:0}).format(total) + (hasPoa ? " plus price-on-request items" : "") : (hasPoa ? "Price on request" : "£0");
    }
    checkboxes.forEach(function (box) { box.addEventListener("change", sync); });
    sync();
  }

  function setupExhibitorEstimate() {
    var form = document.querySelector('[data-form-kind="exhibitor"]');
    if (!form) return;
    var output = document.querySelector("[data-estimate]");
    function checkedValue(name) {
      var node = form.querySelector('[name="' + name + '"]:checked');
      return node ? node.value : "";
    }
    function sync() {
      var space = form.querySelector('[name="exhibitor-space"]:checked');
      var powerIncluded = space && space.dataset.powerIncluded === "true";
      var powerLabel = document.getElementById("power-question-label");
      var powerHelp = document.getElementById("power-question-help");
      if (powerLabel) powerLabel.textContent = powerIncluded ? "Do you need any additional power sockets for £100 + VAT per socket?" : "Do you need power on your stand for an additional £100 + VAT per socket?";
      if (powerHelp) powerHelp.textContent = powerIncluded ? "Your selected space includes standard power. Select Yes only if you need additional sockets. Charities, government and blue light organisations qualify for a 50% discount on additional sockets." : "Unless indicated here, power may not be possible. Charities, government and blue light organisations qualify for a 50% discount.";
      var base = space ? Number(space.dataset.price || 0) : 0;
      var category = document.getElementById("organisation-category");
      var discounted = category && /Charity|Government|Blue Light/.test(category.value);
      var socketCount = Number((document.getElementById("power-count") || {}).value || 0);
      var staffCount = Number((document.getElementById("additional-staff-count") || {}).value || 0);
      var power = checkedValue("power-required") === "Yes" ? socketCount * (discounted ? 50 : 100) : 0;
      var staff = checkedValue("additional-staff-required") === "Yes" ? staffCount * 50 : 0;
      var total = base + power + staff;
      if (output) output.textContent = space ? "Indicative ex-VAT total: " + new Intl.NumberFormat("en-GB", {style:"currency",currency:"GBP"}).format(total) : "Select a space to see an indicative ex-VAT total.";
      var discount = document.querySelector("[data-power-discount]");
      if (discount) discount.textContent = discounted ? "Your selected organisation category appears eligible for the 50% power discount; Mission Community will verify eligibility." : "Charities, government and blue-light organisations qualify for a 50% power discount.";
    }
    form.addEventListener("change", sync);
    form.addEventListener("input", sync);
    sync();
  }

  function collectFields(form) {
    syncCombinedFields(form);
    var grouped = {};
    form.querySelectorAll("[data-sf-field]").forEach(function (control) {
      if (control.disabled) return;
      var api = control.dataset.sfField;
      if (!api) return;
      if ((control.type === "checkbox" || control.type === "radio") && !control.checked) return;
      var value = control.type === "checkbox" && api === "Terms_and_Conditions__c" ? "1" : control.value;
      if (value === "") return;
      if (!grouped[api]) grouped[api] = [];
      grouped[api].push(value);
    });
    return grouped;
  }

  function missingFieldIds(grouped) {
    return Object.keys(grouped).filter(function (api) {
      return /__c$/.test(api) && !config.customFieldIds[api];
    });
  }

  function missingProductionConfig(form) {
    var missing = [];
    if (!config.endpoint) missing.push("Salesforce endpoint");
    if (!config.orgId) missing.push("Salesforce organisation ID");
    if (!config.returnUrl) missing.push("post-submission return URL");
    if (form.querySelector('[data-config-link="terms"]') && !config.termsUrl) missing.push("Terms and Conditions PDF URL");
    return missing;
  }

  function submitToSalesforce(form, grouped) {
    var postForm = document.createElement("form");
    postForm.method = "post";
    postForm.action = config.endpoint;
    postForm.hidden = true;
    function append(name, value) {
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      postForm.appendChild(input);
    }
    append("oid", config.orgId);
    append("retURL", config.returnUrl);
    append("lead_source", form.dataset.leadSource || "NTE27 Web Form");
    Object.keys(grouped).forEach(function (api) {
      var name = /__c$/.test(api) ? config.customFieldIds[api] : (standardNames[api] || api);
      append(name, grouped[api].join(";"));
    });
    document.body.appendChild(postForm);
    postForm.submit();
  }

  function enableForms() {
    document.querySelectorAll("form[data-web-to-lead]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        syncCombinedFields(form);
        var incompleteGroup = Array.prototype.slice.call(form.querySelectorAll("[data-required-checkbox-group]")).find(function (group) {
          return !group.querySelector('input[type="checkbox"]:checked');
        });
        if (incompleteGroup) {
          setStatus(form, "Please select at least one package.", "error");
          var firstBox = incompleteGroup.querySelector('input[type="checkbox"]');
          if (firstBox) firstBox.focus();
          return;
        }
        if (!form.reportValidity()) {
          setStatus(form, "Please complete the highlighted required fields.", "error");
          return;
        }
        var grouped = collectFields(form);
        var missing = missingFieldIds(grouped);
        if (config.mode === "review") {
          var confirmation = form.dataset.confirmationPreview || "Thank you. We have received your submission.";
          setStatus(form, confirmation, "success");
          return;
        }
        var missingConfig = missingProductionConfig(form);
        if (missingConfig.length) {
          setStatus(form, "Submission is disabled because production configuration is missing: " + missingConfig.join(", ") + ".", "error");
          return;
        }
        if (missing.length) {
          setStatus(form, "Submission is disabled because Salesforce field IDs are missing for: " + missing.join(", ") + ".", "error");
          return;
        }
        submitToSalesforce(form, grouped);
      });
      form.addEventListener("input", function () { syncCombinedFields(form); });
    });
  }

  configureShell();
  enableConditionalSections();
  setupPackageSummary();
  setupExhibitorEstimate();
  enableForms();
}());
