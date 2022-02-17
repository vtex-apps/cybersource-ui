# Cyber Source UI

### Merchant Defined Fields
- In the Merchant Defined Fields Tab, users can define custom fields.
- The text input follows these rules
    1. Any values outside of **{{}}** these curly brackets will be taken at direct value
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