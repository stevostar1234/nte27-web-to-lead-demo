(function () {
  "use strict";

  var config = window.NTE_CONFIG || window.NTE27_CONFIG || {};
  var pricingVersion = "NTE27-2026-08-17";
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
  var standardFieldLimits = {
    Company: 255,
    FirstName: 40,
    LastName: 80,
    Email: 80,
    Phone: 40,
    MobilePhone: 40,
    Title: 128,
    Website: 255,
    Salutation: 40
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
    if (config.siteNotice && document.body && document.createElement && !document.querySelector("[data-site-notice]")) {
      var notice = document.createElement("aside");
      notice.className = "sandbox-notice";
      notice.setAttribute("data-site-notice", "");
      notice.textContent = config.siteNotice;
      var main = document.querySelector("main");
      if (main) main.parentNode.insertBefore(notice, main);
    }
    document.querySelectorAll("[data-current-year]").forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
    document.querySelectorAll('[data-config-link="terms"]').forEach(function (link) {
      if (config.termsUrl) {
        link.href = config.termsUrl;
        if (config.termsLinkLabel) link.textContent = config.termsLinkLabel;
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
        link.title = "The secure upload link is not currently available.";
        link.addEventListener("click", function (event) { event.preventDefault(); });
      }
    });
  }

  function enableConditionalSections() {
    var targets = Array.prototype.slice.call(document.querySelectorAll("[data-conditional-for]"));

    function syncAll() {
      targets.forEach(function (target) {
        var source = document.getElementById(target.dataset.conditionalFor);
        if (!source) return;
        var expected = (target.dataset.conditionalValue || "Yes").split("|");
        var value = source.type === "checkbox" ? (source.checked ? "Yes" : "No") : (source.type === "radio" ? (source.checked ? source.value : "") : source.value);
        var parentConditional = target.parentElement && target.parentElement.closest("[data-conditional-for]");
        var show = expected.indexOf(value) !== -1 && (!parentConditional || !parentConditional.hidden);
        target.hidden = !show;
        target.querySelectorAll("input, select, textarea, button").forEach(function (control) {
          if (control.closest("[data-conditional-for]") !== target) return;
          control.disabled = !show;
          if (control.hasAttribute("data-required-when-visible")) control.required = show;
        });
      });
    }

    targets.forEach(function (target) {
      var source = document.getElementById(target.dataset.conditionalFor);
      if (!source) return;
      source.addEventListener("change", syncAll);
      if (source.type === "radio" && source.name) {
        document.querySelectorAll('input[type="radio"][name="' + source.name + '"]').forEach(function (radio) { radio.addEventListener("change", syncAll); });
      }
    });
    syncAll();
  }

  function configureFieldConstraints() {
    document.querySelectorAll("[data-sf-field]").forEach(function (control) {
      if (!/^(INPUT|TEXTAREA)$/.test(control.tagName) || /^(checkbox|radio|hidden)$/i.test(control.type || "")) return;
      var limit = standardFieldLimits[control.dataset.sfField] || (config.fieldLimits || {})[control.dataset.sfField];
      if (limit && !control.hasAttribute("maxlength")) control.maxLength = limit;
    });
    var londonDateParts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(new Date());
    var londonDate = ["year", "month", "day"].map(function (partName) {
      return londonDateParts.find(function (part) { return part.type === partName; }).value;
    }).join("-");
    document.querySelectorAll('[data-sf-field="Declaration_Date__c"]').forEach(function (control) {
      control.max = londonDate;
      if (config.declarationMinDate) control.min = config.declarationMinDate;
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

  function eventCodeFor(date) {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      year: "numeric",
      month: "numeric"
    }).formatToParts(date || new Date());
    var year = Number(parts.find(function (part) { return part.type === "year"; }).value);
    var month = Number(parts.find(function (part) { return part.type === "month"; }).value);
    return "NTE" + String(month >= 4 ? year + 1 : year);
  }

  function bookingReference() {
    var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var bytes = new Uint8Array(8);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      bytes.forEach(function (_, index) { bytes[index] = Math.floor(Math.random() * 256); });
    }
    var suffix = Array.prototype.map.call(bytes, function (value) {
      return alphabet.charAt(value % alphabet.length);
    }).join("");
    return "NTE-" + Date.now() + "-" + suffix;
  }

  function populateSystemFields(form) {
    var eventField = form.querySelector('[data-sf-field="NTE_Event_Code__c"]');
    if (eventField) eventField.value = config.eventCode || eventCodeFor(new Date());
    var bookingField = form.querySelector('[data-sf-field="Booking_Reference__c"]');
    if (bookingField && !bookingField.value) bookingField.value = bookingReference();
    var logoField = form.querySelector('[data-sf-field="Logo_Upload_URL__c"]');
    if (logoField) logoField.value = config.logoFileRequestUrl || "";
  }

  function setPricingField(form, api, value) {
    var field = form.querySelector('[data-sf-field="' + api + '"]');
    if (field) field.value = String(value);
  }

  function calculatePartnerPricing(selectedPrices) {
    var total = 0;
    var priceOnRequest = false;
    selectedPrices.forEach(function (rawPrice) {
      if (rawPrice === "poa") {
        priceOnRequest = true;
        return;
      }
      var price = Number(rawPrice);
      if (Number.isFinite(price)) total += price;
    });
    return {packageTotal: total, total: total, priceOnRequest: priceOnRequest};
  }

  function calculateExhibitorPricing(options) {
    options = options || {};
    var priceOnRequest = options.spacePrice === "poa";
    var spacePrice = priceOnRequest ? 0 : Number(options.spacePrice || 0);
    var discounted = /Charity|Government|Blue Light/.test(options.category || "");
    var socketCount = Math.max(0, Number(options.socketCount || 0));
    var staffCount = Math.max(0, Number(options.staffCount || 0));
    var powerUnitPrice = options.powerRequired === "Yes" ? (discounted ? 50 : 100) : 0;
    var staffUnitPrice = options.staffRequired === "Yes" ? 50 : 0;
    var powerTotal = powerUnitPrice * socketCount;
    var staffTotal = staffUnitPrice * staffCount;
    var listedTotal = (Number.isFinite(spacePrice) ? spacePrice : 0) + powerTotal + staffTotal;
    return {
      spacePrice: Number.isFinite(spacePrice) ? spacePrice : 0,
      powerUnitPrice: powerUnitPrice,
      powerTotal: powerTotal,
      staffUnitPrice: staffUnitPrice,
      staffTotal: staffTotal,
      total: listedTotal,
      discounted: discounted,
      priceOnRequest: priceOnRequest,
      invoiceRequired: priceOnRequest || listedTotal > 0
    };
  }

  function eligibleCategoriesForSpace(spaceName) {
    var restrictions = {
      "Local Government Authority - Single - £249.50 + VAT": ["Local Government or LG related"],
      "Blue Light - Single - £249.50 + VAT": ["Employer - Blue Light & NHS"],
      "Trade Association - Single - £499 + VAT": ["Trade Association"],
      "COBSEO Charity - Single - Free": ["Charity - member of Cobseo"],
      "Non COBSEO Charity - Single - Free": ["Charity - not a member of Cobseo"]
    };
    return restrictions[spaceName] || [];
  }

  function syncExhibitorEligibility(form, category) {
    form.querySelectorAll('[name="exhibitor-space"]').forEach(function (space) {
      var allowed = eligibleCategoriesForSpace(space.value);
      var unavailable = Boolean(category) && allowed.length > 0 && allowed.indexOf(category) === -1;
      if (unavailable && space.checked) space.checked = false;
      space.disabled = unavailable;
      var option = space.closest("label");
      if (option) {
        option.classList.toggle("option-unavailable", unavailable);
        if (unavailable) option.setAttribute("aria-disabled", "true");
        else option.removeAttribute("aria-disabled");
      }
    });
  }

  function setupPackageSummary() {
    var checkboxes = Array.prototype.slice.call(document.querySelectorAll("[data-package-price]"));
    var countNode = document.querySelector("[data-package-count]");
    var totalNode = document.querySelector("[data-package-total]");
    if (!checkboxes.length || !countNode || !totalNode) return;
    function sync() {
      var selected = checkboxes.filter(function (box) { return box.checked; });
      var pricing = calculatePartnerPricing(selected.map(function (box) { return box.dataset.packagePrice; }));
      var total = pricing.total;
      var hasPoa = pricing.priceOnRequest;
      countNode.textContent = selected.length ? selected.length + " package" + (selected.length === 1 ? "" : "s") + " selected" : "No packages selected";
      totalNode.textContent = total ? "Listed-price total: " + new Intl.NumberFormat("en-GB", {style:"currency",currency:"GBP",maximumFractionDigits:0}).format(total) + (hasPoa ? " plus price-on-request items" : "") : (hasPoa ? "Price on request" : "£0");
      var form = checkboxes[0].form;
      if (form) {
        setPricingField(form, "Sponsor_Package_Total__c", pricing.packageTotal);
        setPricingField(form, "Listed_Price_Total__c", pricing.total);
        setPricingField(form, "Price_On_Request__c", hasPoa ? "1" : "0");
        setPricingField(form, "Pricing_Status__c", hasPoa ? "Price on request" : "Calculated");
        setPricingField(form, "Pricing_Version__c", pricingVersion);
      }
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
      var category = document.getElementById("organisation-category");
      syncExhibitorEligibility(form, category ? category.value : "");
      var space = form.querySelector('[name="exhibitor-space"]:checked');
      var powerIncluded = space && space.dataset.powerIncluded === "true";
      var powerLabel = document.getElementById("power-question-label");
      var powerHelp = document.getElementById("power-question-help");
      if (powerLabel) powerLabel.textContent = powerIncluded ? "Do you need any additional power sockets for £100 + VAT per socket?" : "Do you need power on your stand for an additional £100 + VAT per socket?";
      if (powerHelp) powerHelp.textContent = powerIncluded ? "Your selected space includes standard power. Select Yes only if you need additional sockets. Charities, government and blue light organisations qualify for a 50% discount on additional sockets." : "Unless indicated here, power may not be possible. Charities, government and blue light organisations qualify for a 50% discount.";
      var socketCount = Number((document.getElementById("power-count") || {}).value || 0);
      var staffCount = Number((document.getElementById("additional-staff-count") || {}).value || 0);
      var pricing = calculateExhibitorPricing({
        spacePrice: space ? space.dataset.price : 0,
        category: category ? category.value : "",
        powerRequired: checkedValue("power-required"),
        socketCount: socketCount,
        staffRequired: checkedValue("additional-staff-required"),
        staffCount: staffCount
      });
      var priceOnApplication = pricing.priceOnRequest;
      var total = pricing.total;
      var discounted = pricing.discounted;
      setPricingField(form, "Exhibitor_Space_Price__c", pricing.spacePrice);
      setPricingField(form, "Power_Socket_Unit_Price__c", pricing.powerUnitPrice);
      setPricingField(form, "Power_Socket_Total__c", pricing.powerTotal);
      setPricingField(form, "Additional_Staff_Unit_Price__c", pricing.staffUnitPrice);
      setPricingField(form, "Additional_Staff_Total__c", pricing.staffTotal);
      setPricingField(form, "Listed_Price_Total__c", pricing.total);
      setPricingField(form, "Price_On_Request__c", priceOnApplication ? "1" : "0");
      setPricingField(form, "Pricing_Status__c", priceOnApplication ? "Price on request" : "Calculated");
      setPricingField(form, "Pricing_Version__c", pricingVersion);
      var invoiceField = document.getElementById("invoice-required");
      if (invoiceField) {
        var noInvoiceOption = Array.prototype.find.call(invoiceField.options, function (option) { return option.value === "No"; });
        if (noInvoiceOption) noInvoiceOption.disabled = pricing.invoiceRequired;
        if (pricing.invoiceRequired && invoiceField.value !== "Yes") {
          invoiceField.value = "Yes";
          invoiceField.dispatchEvent(new Event("change", {bubbles: true}));
        }
      }
      if (output) {
        if (!space) output.textContent = "Select a space to see an indicative ex-VAT total.";
        else if (priceOnApplication && total) output.textContent = "Listed add-ons: " + new Intl.NumberFormat("en-GB", {style:"currency",currency:"GBP"}).format(total) + " plus the space price on application.";
        else if (priceOnApplication) output.textContent = "Space price on application.";
        else output.textContent = "Indicative ex-VAT total: " + new Intl.NumberFormat("en-GB", {style:"currency",currency:"GBP"}).format(total);
      }
      var discount = document.querySelector("[data-power-discount]");
      if (discount) discount.textContent = discounted ? "Your selected organisation category appears eligible for the 50% power discount; Mission Community will verify eligibility." : "Charities, government and blue-light organisations qualify for a 50% power discount.";
    }
    form.addEventListener("change", sync);
    form.addEventListener("input", sync);
    sync();
  }

  function setupStaffEstimate() {
    var form = document.querySelector('[data-form-kind="staff-update"]');
    if (!form) return;
    function sync() {
      var required = (document.getElementById("staff-additional") || {}).value === "Yes";
      var count = Number((document.getElementById("staff-additional-count") || {}).value || 0);
      setPricingField(form, "Additional_Staff_Unit_Price__c", required ? 50 : 0);
      setPricingField(form, "Additional_Staff_Total__c", required ? count * 50 : 0);
      setPricingField(form, "Pricing_Version__c", pricingVersion);
    }
    form.addEventListener("change", sync);
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
      if (typeof value === "string") value = value.trim();
      if (control.type === "date") value = formatWebToLeadDate(value);
      if (value === "") return;
      if (!grouped[api]) grouped[api] = [];
      grouped[api].push(value);
    });
    return grouped;
  }

  function formatWebToLeadDate(value) {
    var match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match || config.salesforceDateFormat !== "DMY") return value;
    return match[3] + "/" + match[2] + "/" + match[1];
  }

  function hasBlankRequiredText(form) {
    var blank = Array.prototype.slice.call(form.querySelectorAll("input[required], textarea[required]")).find(function (control) {
      if (control.disabled || control.type === "checkbox" || control.type === "radio") return false;
      return String(control.value || "").trim() === "";
    });
    if (!blank) return false;
    blank.setCustomValidity("Please enter a value.");
    blank.reportValidity();
    blank.focus();
    return true;
  }

  function normalizeBookingReferences(form) {
    form.querySelectorAll('[data-sf-field="Target_Booking_Reference__c"]').forEach(function (control) {
      control.value = String(control.value || "").trim().toUpperCase();
    });
  }

  function setRuleError(form, control, message) {
    if (control) {
      control.setCustomValidity(message);
      control.reportValidity();
      control.focus();
    }
    setStatus(form, message, "error");
    return false;
  }

  function validateStaffUpdate(form) {
    if (form.dataset.formKind !== "staff-update") return true;
    var totalControl = document.getElementById("staff-total");
    var namesControl = document.getElementById("updated-staff-names");
    var additionalControl = document.getElementById("staff-additional");
    var additionalCountControl = document.getElementById("staff-additional-count");
    var total = Number(totalControl && totalControl.value);
    var names = String((namesControl || {}).value || "").split(/\r?\n/).filter(function (name) { return name.trim(); });
    if (Number.isFinite(total) && total > 0 && names.length !== total) {
      return setRuleError(form, namesControl, "Enter one attendee name per line so the list matches the total attending.");
    }
    if (additionalControl && additionalControl.value === "Yes") {
      var additional = Number((additionalCountControl || {}).value);
      if (!Number.isFinite(additional) || additional <= 0 || (Number.isFinite(total) && total > 0 && additional > total)) {
        return setRuleError(form, additionalCountControl, "The additional-staff count must not exceed the total attending.");
      }
    }
    return true;
  }

  function validateHeavyItems(form) {
    if (!form.querySelector("#item1-description")) return true;
    for (var itemNumber = 2; itemNumber <= 3; itemNumber++) {
      var description = document.getElementById("item" + itemNumber + "-description");
      var registration = document.getElementById("item" + itemNumber + "-registration");
      var dimensions = document.getElementById("item" + itemNumber + "-dimensions");
      var weight = document.getElementById("item" + itemNumber + "-weight");
      var controls = [description, registration, dimensions, weight];
      var hasAnyValue = controls.some(function (control) { return control && String(control.value || "").trim(); });
      if (hasAnyValue && (!String(description.value || "").trim() || !String(dimensions.value || "").trim() || !String(weight.value || "").trim())) {
        return setRuleError(form, !String(description.value || "").trim() ? description : (!String(dimensions.value || "").trim() ? dimensions : weight),
          "Each additional item needs a description, dimensions and gross weight.");
      }
      if (itemNumber === 3 && hasAnyValue && !String((document.getElementById("item2-description") || {}).value || "").trim()) {
        return setRuleError(form, document.getElementById("item2-description"), "Enter item 2 before adding item 3.");
      }
    }
    return true;
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
    append("lead_source", form.dataset.leadSource || "Web");
    append("useDefaultRule", "1");
    Object.keys(grouped).forEach(function (api) {
      var name = /__c$/.test(api) ? config.customFieldIds[api] : (standardNames[api] || api);
      append(name, grouped[api].join(";"));
    });
    document.body.appendChild(postForm);
    postForm.submit();
  }

  function enableForms() {
    document.querySelectorAll("form[data-web-to-lead]").forEach(function (form) {
      populateSystemFields(form);
      var honeypot = document.createElement("input");
      honeypot.type = "text";
      honeypot.name = "website_confirm";
      honeypot.tabIndex = -1;
      honeypot.autocomplete = "off";
      honeypot.setAttribute("aria-hidden", "true");
      honeypot.style.position = "absolute";
      honeypot.style.left = "-10000px";
      honeypot.style.width = "1px";
      honeypot.style.height = "1px";
      honeypot.dataset.formHoneypot = "";
      form.appendChild(honeypot);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (form.dataset.submitting === "true") return;
        if (honeypot.value) {
          setStatus(form, "Your submission could not be processed. Please reload the page and try again.", "error");
          return;
        }
        populateSystemFields(form);
        syncCombinedFields(form);
        normalizeBookingReferences(form);
        var incompleteGroup = Array.prototype.slice.call(form.querySelectorAll("[data-required-checkbox-group]")).find(function (group) {
          return !group.querySelector('input[type="checkbox"]:checked');
        });
        if (incompleteGroup) {
          setStatus(form, incompleteGroup.dataset.requiredMessage || "Please select at least one option.", "error");
          var firstBox = incompleteGroup.querySelector('input[type="checkbox"]');
          if (firstBox) firstBox.focus();
          return;
        }
        form.querySelectorAll("input[required], textarea[required]").forEach(function (control) {
          control.setCustomValidity("");
        });
        if (hasBlankRequiredText(form)) {
          setStatus(form, "Please complete the highlighted required fields.", "error");
          return;
        }
        if (!validateStaffUpdate(form) || !validateHeavyItems(form)) return;
        if (!form.reportValidity()) {
          setStatus(form, "Please complete the highlighted required fields.", "error");
          return;
        }
        var grouped = collectFields(form);
        var missing = missingFieldIds(grouped);
        if (config.mode === "review") {
          var confirmation = form.dataset.confirmationPreview || "Thank you. We have received your submission.";
          var reference = grouped.Booking_Reference__c && grouped.Booking_Reference__c[0];
          if (reference) confirmation += " Your booking reference is " + reference + ".";
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
        form.dataset.submitting = "true";
        form.setAttribute("aria-busy", "true");
        form.querySelectorAll('[type="submit"]').forEach(function (button) {
          button.disabled = true;
          button.dataset.originalText = button.textContent;
          button.textContent = "Submitting…";
        });
        submitToSalesforce(form, grouped);
      });
      form.addEventListener("input", function (event) {
        syncCombinedFields(form);
        if (event.target && event.target.setCustomValidity && String(event.target.value || "").trim()) event.target.setCustomValidity("");
      });
    });
  }

  configureShell();
  enableConditionalSections();
  configureFieldConstraints();
  setupPackageSummary();
  setupExhibitorEstimate();
  setupStaffEstimate();
  enableForms();

  window.NTEFormUtils = {
    eventCodeFor: eventCodeFor,
    bookingReference: bookingReference,
    calculatePartnerPricing: calculatePartnerPricing,
    calculateExhibitorPricing: calculateExhibitorPricing,
    eligibleCategoriesForSpace: eligibleCategoriesForSpace,
    formatWebToLeadDate: formatWebToLeadDate
  };
}());
