# NTE27 Form Field Provenance and Change Rationale

Last reviewed: 13 August 2026

This document records why every visible form field exists and where it came from. It is a requirements-traceability record, not legal or compliance approval. The Salesforce API names shown in the HTML are proposed mappings until the Phase 3 Salesforce fields and automation are implemented and validated.

## Source register

- **Kate exhibitor workbook:** `260729 NTE27 Exhibitor Expression of Interest to Exhibit Questions.xlsx`, sheet `Questions to Ask`. This is the principal source for the exhibitor application questions.
- **Kate process workbook:** `260427 NTE26 Exhibitor Process (2) (1).xlsx`. This describes operational stages such as invitation, registration, invoicing, payment, allocation, confirmation and arrival. It is a process source, not a question-by-question form specification.
- **Kate emails and written feedback:** the emails supplied in the project brief, including the request to separate exhibitor and partner/sponsor journeys, price and multi-select sponsor packages, staff and heavy-vehicle follow-ups, power charges, accessibility requirements, acknowledgements, approval messages, logo collection, terms, guest registration and optional add-ons.
- **Partner/sponsor Microsoft Forms:** `https://forms.cloud.microsoft/e/eKBk2tj5a2` and `https://forms.cloud.microsoft/e/UtVv8GT8Dn`, supplied by Kate as the two partner/sponsor forms to combine.
- **Heavy-vehicle Microsoft Form:** `https://forms.cloud.microsoft/e/UhqUZsvNGq`, supplied by Kate as the current logistics questionnaire.
- **Tony guest questionnaire:** `Guests Question (002).docx`, supplied by Kate after the original request.
- **Client email copy:** `Auto response, Exhibitor, Govt&Charity confirmation email templates.docx` and the four supplied HTML email templates.
- **User-directed change:** a decision or wording supplied directly by the project lead in this task after reviewing the client material.
- **Project-added:** a field or adaptation introduced by the implementation team to make the journey usable, identifiable or Salesforce-compatible. It was not requested verbatim by Kate or Tony.

Where sources conflict, the priority used here is: later client feedback, then the attached source questionnaire, then explicit user direction, then project-added design decisions.

## 1. Partner / sponsor expression of interest

This is the public, pre-qualification journey. Kate explicitly said the priced partner/sponsor application is onboarding rather than expression of interest and should not appear publicly. The project lead therefore requested a separate, simple public expression-of-interest form.

### Fields

- **Organisation name** — adapted from the client’s partner/sponsor and exhibitor forms; standard identity field.
- **Organisation type** — project-added qualification field. It supports routing and the charity/government distinction but was not supplied as an exact EOI question.
- **Website** — adapted from the client’s commercial forms; useful for qualification.
- **First name and surname** — adapted from the client forms and Kate’s question about separating names for personalised emails.
- **Job title, email address and telephone number** — adapted from the client’s commercial contact questions.
- **Partnering, sponsoring or both** — project-added to distinguish the enquiry before packages are discussed.
- **Areas of interest** — project-added multi-select covering partnership, headline/gold/premier/champion opportunities, zone sponsorship, stage/content, event assets, Escapade, Troops’ Track Day and other ideas. It intentionally does not show prices because this is pre-qualification.
- **Why the organisation would like to participate** — user-requested/project-added narrative qualification question.
- **What the organisation would like the relationship to achieve** — user-requested/project-added narrative qualification question.
- **Preferred contact method and best time to contact** — project-added follow-up fields.
- **How the applicant heard about NTE27** — adapted from the exhibitor questionnaire.
- **Permission for Mission Community to make contact** — project-added journey-specific consent. The final privacy wording still requires client/legal approval.

### Important boundary

This form captures interest only. It does not select packages, agree prices, collect invoicing details or confirm acceptance.

## 2. Exhibitor application

This is the standalone exhibitor application Kate explicitly requested, separate from partner/sponsor onboarding.

### Organisation and applicant

- **Organisation name for marketing** — Kate exhibitor workbook.
- **Alternative or former organisation name** — Kate exhibitor workbook.
- **Organisation category** — Kate exhibitor workbook, adapted to support commercial, charity, government and blue-light pricing rules described in Kate’s feedback.
- **Organisation website** — Kate exhibitor workbook.
- **Title/prefix, first name, surname, job title, email, mobile and work/landline phone** — Kate exhibitor workbook. First and surname are separate in line with Kate’s email-personalisation question.
- **Second contact switch and second contact prefix, name, job title, email, mobile and work phone** — Kate exhibitor workbook. Conditional display is a project implementation choice.

### Event history and application details

- **Previously attended NTE2024, NTE2025 and NTE2026** — Kate’s workbook originally contained three separate year questions. The project lead directed that they be presented as three independent checkboxes. Each checked year maps to its own proposed Salesforce checkbox; an unchecked year means No. No separate “None” option is needed.
- **Planned number of exhibitor staff** — Kate exhibitor workbook.
- **Exhibition-space selection** — Kate exhibitor workbook and client pricing material. Prices are shown in the interface to support the application decision.
- **Power required and number of sockets** — Kate’s written feedback: £100 + VAT per socket, availability not guaranteed unless requested, with a 50% discount for charities, government and blue-light organisations. Conditional display and the indicative calculation are project implementation choices.
- **Additional staff required and number above the included allocation** — Kate’s written feedback: £50 + VAT per additional person.
- **Names of colleagues, one per line** — Kate’s written feedback, including the instruction that names may change later.
- **Indicative ex-VAT total** — project-added calculation using the client-supplied space, socket and extra-staff prices. It is not an invoice or quote.

### Space, equipment and accessibility

- **Sunday setup availability** — Kate exhibitor workbook.
- **Equipment beyond display stands and laptops** — Kate exhibitor workbook and written feedback.
- **Heavy vehicles/items indicator** — Kate’s written feedback. The detailed logistics questionnaire is intentionally sent later because Kate said applicants often do not have final details at initial application.
- **Accessibility required and free-text details** — Kate’s written feedback and workbook. The project lead later directed that the question be general and not single out disabled parking.

### Quotation and invoicing

- **Quotation or invoice required** — Kate exhibitor workbook. The help text was clarified by the project lead to cover free space with no chargeable sockets or staff.
- **Invoice organisation, addressee, postal address, email and telephone** — Kate exhibitor workbook.
- **Purchase order required and purchase-order number** — Kate exhibitor workbook.
- **Quotation required to raise a purchase order** — Kate exhibitor workbook.
- **Supplier agreement required** — Kate exhibitor workbook.
- **Conditional display of billing details** — project implementation choice so applicants who genuinely need neither a quote nor invoice are not asked for irrelevant billing fields.

### Final details and declaration

- **Industry body or trade-association membership** — Kate exhibitor workbook.
- **How the applicant heard about NTE27** — Kate exhibitor workbook.
- **Declaration name** — explicitly required in Kate’s workbook: “Declaration - By entering your name in the box below…”. It has therefore been retained under the instruction to remove declaration-name fields only when the client had not specified one.
- **Agreement to NTE27 Terms and Conditions and Privacy Policy** — Kate requested a Terms and Conditions link; the project lead directed the current visible wording to use “Privacy Policy” instead of “payment terms”. The client must still supply or approve the final URLs and legal wording.

## 3. Partner / sponsor application

This is the direct-link application used after Mission Community has discussed and qualified the opportunity. Kate said the two existing partner/sponsor forms could be amalgamated and that this is onboarding, not public expression of interest.

### Organisation and contacts

- **Organisation name for marketing, applicant first name, surname, job title, email and telephone** — combined from the two client partner/sponsor Microsoft Forms; name split also follows Kate’s email-personalisation question.
- **Whether the applicant is the main event-day contact** — client partner/sponsor form.
- **Event-day contact first name, surname, job title, email and mobile** — client partner/sponsor form. Conditional display is a project implementation choice.

### Package selection

- **Partner/sponsor package selections** — Kate’s written package list and prices. Checkboxes intentionally allow more than one package because Kate wrote, “More than one package could be allowed”.
- **Headline Partner £30,000; Gold Partner £15,000; Premier Partner £7,000; Champion Partner £2,000; Zone Sponsor £5,000; Community Stage Sponsor £6,000; Podcast Corner Sponsor £6,000; Event Guide Sponsor £5,000; Delegate Tote Bag Sponsor £5,000; Helmet Bay Sponsor £3,000; Auditorium Sponsor £5,000; Live Stream Sponsor £6,000; Wristband Sponsor £3,000; Escapade Sponsor £9,000; Troops’ Track Day Partner price on request** — Kate’s written list. “Zone” is displayed as “Zone Sponsor” for applicant clarity following project-lead direction.
- **Selected package count and listed-price total** — project-added interface summary. It excludes VAT and price-on-request items and does not constitute a quote or invoice.

### Exhibition space and operations

- **Space size and preferred position** — removed following the client review on 13 August 2026. Mission Community confirmed that the selected partner/sponsor package already includes the appropriate exhibition space, so applicants do not need to choose a size or position.
- **Sunday setup, power, equipment, accessibility requirement/details, colleague names and other space notes** — combined client partner/sponsor exhibition-space form and Kate’s written feedback.
- **Heavy vehicles/items indicator and later logistics-form notice** — Kate’s written feedback. Detailed questions remain in the separate later-stage form.

### Quotation, invoicing and agreement

- **Quotation before invoice, invoice organisation, invoice addressee, postal address, invoice email, purchase-order requirement and purchase-order number** — combined client partner/sponsor application form.
- **Agreement to NTE27 Terms and Conditions and Privacy Policy** — Kate’s terms-link requirement plus the project lead’s current wording direction. Final URLs and wording still need client/legal approval.

### Deliberately absent

- **Declaration name** — not included because no supplied partner/sponsor source explicitly required a separate declaration-name field.
- **Internal submission alert** — not currently linked because this application follows staff qualification and is sent directly by Mission Community. The immediate applicant receipt and later confirmed-application message are provided.

## 4. Guest registration

This form implements Tony’s supplied `Guests Question (002).docx`.

### Fields

- **Guest first name and surname** — Tony specified “Name”; split into first and surname as a project adaptation for Salesforce and personalised emails.
- **Email, phone, organisation and job title** — Tony guest questionnaire.
- **Accompanying guest yes/no** — Tony guest questionnaire.
- **Accompanying guest first name, surname and email** — Tony specified accompanying person name and email; the name is split for Salesforce. Conditional display is a project implementation choice.
- **Accessibility requirement yes/no and free-text arrangements** — Tony guest questionnaire. Visible wording was generalised at the project lead’s direction.
- **Accuracy and permission declaration** — project-added safeguard because a registrant may submit another person’s personal details. The exact wording should receive client/privacy approval before production.
- **Fallback organisation value for individual guests** — project implementation detail required because Web-to-Lead requires a company value.

## 5. Exhibitor staff details update

Kate asked how attendee names could be updated nearer the event and suggested that this might need a separate form. This is the resulting later-stage update journey.

### Fields

- **Organisation name, submitting contact first name, surname and original application email** — adapted from the original application so Salesforce can identify the booking.
- **Application reference** — project-added reconciliation key; it is optional until the Salesforce process confirms how references will be issued.
- **Total attending, whether the total exceeds the allocation, number above allocation and full attendee list** — adapted from Kate’s staff questions and £50 + VAT additional-staff rule.

### Important boundary

Web-to-Lead cannot reopen the original browser submission. Phase 3 automation must match this supplementary submission to exactly one booking or send it to a manual reconciliation queue.

## 6. Heavy Vehicle, Equipment and Haulier details

Kate supplied the current Microsoft Form and asked for its questions to be captured for exhibitors bringing large vehicles or equipment. Because she also said the details are often unavailable at initial application, the full questionnaire is a later-stage form linked from the initial indicator.

### Identification and contacts

- **Exhibiting organisation, main contact, email and direct phone** — heavy-vehicle Microsoft Form. Main-contact name is split into first and surname as a Salesforce adaptation.
- **Application reference** — project-added reconciliation key.
- **Second contact name, email and phone** — heavy-vehicle Microsoft Form.
- **Planned delivery window** — heavy-vehicle Microsoft Form.

### Exhibition items

- **Description/manufacturer/model, registration where applicable, dimensions and gross weight for items 1, 2 and 3** — heavy-vehicle Microsoft Form. The three repeated groups are a fixed Web-to-Lead representation of the current questionnaire.

### Haulier

- **Haulier name, staff names, vehicle type, vehicle gross weight without the exhibition item, dimensions and registration** — heavy-vehicle Microsoft Form.

### Important boundary

Phase 3 automation must associate this supplementary submission with the correct approved exhibitor or partner/sponsor booking.

## 7. Logo upload

This page has no Salesforce form fields.

- **Secure upload link** — project-added response to Kate’s request for a single place to collect approved organisations’ logos without handling email attachments manually.
- **Preferred formats and filename guidance** — project-added operational guidance.
- **Visible copy and layout** — simplified after the client review on 13 August 2026 to use short, natural instructions and mention the secure upload only once. Approval-stage explanations were removed because only approved organisations receive this page.
- **Microsoft 365 File Request destination** — proposed implementation. Mission Community must supply the final File Request URL and confirm the controlled SharePoint/OneDrive folder and access rules.

## Email-template provenance

- **Exhibitor application received and internal notification** — adapted from the supplied exhibitor HTML templates and Kate’s application-autoresponder wording.
- **Approved paid exhibitor confirmation** — based on the supplied exhibitor confirmation wording, including invoice, power, additional staff, logo and final-event-detail messages.
- **Approved government/charity confirmation** — based on the supplied government/charity confirmation wording.
- **Partner/sponsor expression-of-interest receipt and internal notification** — project-added for the public pre-qualification journey requested by the project lead; field summaries reflect that new form.
- **Partner/sponsor application received** — adapted from the supplied sponsor applicant confirmation and renamed to make clear that receipt is not approval.
- **Partner/sponsor application confirmed** — project-added at the project lead’s current request, based on Kate’s described post-approval process: confirm the application, state that a quotation/invoice will follow where applicable, and request the latest logo.
- **Guest registration receipt and internal notification** — project-added around Tony’s supplied questionnaire.
- **Staff-update and heavy-vehicle receipts** — project-added acknowledgements for the later-stage forms.

## Outstanding approvals and implementation dependencies

- Final NTE27 Terms and Conditions URL, Privacy Policy URL and approved agreement wording.
- Final Microsoft 365 File Request URL and storage ownership/access rules.
- Salesforce field IDs, object/record model and automation for every proposed custom field.
- Reconciliation rules for staff and logistics updates.
- Approved sender, reply-to address, subject lines and final copy for each email.
- Any approved Escapade ticket add-on price, VAT, quantity and capacity rules; the current sponsor package is not the same as a bookable ticket add-on.
- End-to-end security review, privacy review, accessibility testing and user acceptance testing before production submissions are enabled.
