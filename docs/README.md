📢 Use this project, [contribute](https://github.com/vtex-apps/cybersource) to it or open issues to help evolve it using [Store Discussion](https://github.com/vtex-apps/store-discussion).

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

# CyberSource IO

This app uses the CyberSource REST API to process payments, risk management, and taxes.

## Configuration

1. [Install](https://developers.vtex.com/vtex-developer-docs/docs/vtex-io-documentation-installing-an-app) `vtex.cybersource` and `vtex.cybersource-ui` in the desired account.

2. In Cybersource EBC, generate authentication keys.
	- Payment Configuration -> Key Management -> Generate Key
	- Choose `REST - Shared Secret` and Generate Key

3. In VTEX Admin, search for "Cybersource" to find the admin panel as shown below:
	![image](https://user-images.githubusercontent.com/47258865/178300211-3d3eadf2-6f44-4db4-95dd-76fae2bfebc4.png)

  - Enter your `Merchant ID`
  - Enter your `Merchant Key` and `Shared Secret Key` from step 2
  - Select a `Processor` (choose "Other" if your processor does not appear in the list) 
  - Select a `Region` (choose "Other" if your region does not appear in the list)
  - Optionally enter a `Reference Suffix` (by default, orders in CyberSource's system will be associated with the VTEX order group ID, but this setting can be used to append a suffix such as "-01")
  - Optionally enter a `Custom NSU`
  - Choose whether to `Enable Tax Calculations` if you wish to use CyberSource as your tax calculation provider in checkout
  - Choose whether to `Enable Transaction Posting` to post completed transactions for tax reporting
  - Optionally enter any `Sales Channels to Exclude from CyberSource`
  - Optionally enter a `Shipping Product Code` for purposes of shipping tax calculation
  - Optionally enter a list of `Tax Nexus Regions`
  - Click `Save Settings`

4. In VTEX Admin, navigate to Payment Settings (`/admin/pci-gateway/#/rules`)
	- Select the Gateway Affiliations tab and click the green plus to add a new affiliation
	- From the list of gateways, select `Cybersource IO`
	- Configure the affiliation as follows: 
    - Leave `Application Key` & `Application Token` blank (they are not used)
	  - Select the desired `Payment settlement` behavior: 
      - "Use Behavior Recommended By The Payment Processor" will result in authorized payments being automatically captured after 4 days (or if the order is invoiced, whichever comes first)
      - "Deactivated" will result in payments being captured only when the VTEX order is invoiced
	  - Enter your `Company Name` and `Company Tax Id`
    - `Capture Setting`: if set to "Immediate Capture", the connector will send a single "Auth and Capture" request to CyberSource when the order is placed; otherwise it will follow standard VTEX behavior (separate calls for auth and capture) 
    - `Merchant Id`, `Merchant Key`, and `Shared Secret Key` are optional overrides; if left blank, the connector will read these values from the settings entered in step 3
  - Click `Save`
	![image](https://user-images.githubusercontent.com/47258865/178299999-a27149a6-f937-4602-96ed-d232d8795095.png)

5. In VTEX Admin, still in the Payment Settings interface
	- Select the Payment Conditions tab
  - Click the green plus to add a new payment condition for the desired credit card type (ex. Visa)
  - In `Process with affiliation`, choose `Cybersource IO` (or if you have customized the name of the affiliation, select the name you entered)
  - Click `Save`
  - Repeat as needed for other credit card types
  - If you previously created credit card payment rules for other gateways (including the legacy CyberSource connector), you may set these rules to `Inactive`. Transactions in progress that were started on that connector will still be processed by it even if it is inactive; only new transactions will be processed by the new connector. 
    - If you need to roll back to the previous connector for any reason, simply set its payment rule(s) to `Active` and set the `Cybersource IO` payment rule(s) to `Inactive`.   

### Optional: Device Fingerprint

Add the following code to your checkout custom JS and replace `{{ORG_ID}}` and `{{MERCHANT_ID}}` with the appropriate values.
```
function addsDeviceFingerPrint() {
  if (!window.vtex) return;
  if (window.vtex.deviceFingerprint) return;
  $.ajax({
    type: 'get',
    async: true,
    url: rootPath() + '/api/sessions?items=*'
  }).then(function(response) {
    var ORG_ID = "{{ORG_ID}}";
    var MERCHANT_ID = "{{MERCHANT_ID}}";
    console.log('session', response);
    window.vtex.deviceFingerprint = response.id;
    var sessionId = response.id || "CYBERSOURCE";
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://h.online-metrix.net/fp/tags.js?org_id=${ORG_ID}&session_id=${MERCHANT_ID}${sessionId}`;
    document.head.appendChild(script);
    var noScript = document.createElement("noscript");
    var iframe = document.createElement("iframe");
    iframe.style = "width: 100px; height: 100px; border: 0; position: absolute; top: -5000px;";
    iframe.src = `https://h.online-metrix.net/fp/tags?org_id=${ORG_ID}&session_id=${MERCHANT_ID}${sessionId}`;
    noScript.appendChild(iframe);
    document.body.appendChild(noScript);
  })
}
```

### Optional: Merchant Defined Fields

- In VTEX Admin, search for "Cybersource" to navigate to the app's admin panel.
- In the `Merchant Defined Fields` tab, users can define custom fields.
- The text input follows these rules:
    1. Any values outside of **{{}}** curly brackets will be taken at direct value
    2. Any values between the **{{}}** must be in the following format `Reference Word|Modification Word|Values`
        1. All reference words can be found in the `Show All Referencable Words` dropdown
            1. Reference words can be left blank if `Modification Word` and `Values` are present
            2. Reference word is case sensitive
        2. Modification Words are either `Pad` or `date`
        3. If using `Pad`, the `Values` must be either in the format of a `number` or `desired length:fill character`
            1. `fill character` must be a single value. For example, `9:x` will result in a desired length of 9, and filling empty spaces with x 
        4. If using `date`, the `Values` must be in the format of `dd/MM/yyyy` or any combination of it.
            1. `M` for month must be capitalized. This format can be scrambled to your liking, such as `yyyy/MM` or `yyyy` or `dd/yyyy/MM`
    3. Every new line is a new Merchant Defined Field
- Examples

| Input  | Is it Valid? | Reason |
| ------------- | ------------- | ------------- |
| {{MiniCart.Buyer.LastName}},{{MiniCart.Buyer.FirstName}}  | Valid  | Reference words are valid |
| 26940{{\|date\|yy}  | Invalid  | Missing second closing bracket |
| 26940{{\|date\|yy}}  | Valid  | Valid |
| currency{{notaword}}  | Invalid  | Invalid reference word |

## Contributors ✨

Thanks go to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
