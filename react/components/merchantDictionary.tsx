import type { FunctionComponent } from 'react'
import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { Button, Table, Tag, Textarea } from 'vtex.styleguide'

const MerchantDictionary: FunctionComponent<any> = (props: any) => {
  const defaultSchema = {
    properties: {
      userInput: {
        title: 'User Input',
        width: 300,
      },
      isValid: {
        title: 'Valid',
        minWidth: 100,
        cellRenderer: ({ cellData }: any) => {
          return cellData ? (
            <Tag type="success" variation="low">
              Valid
            </Tag>
          ) : (
            <Tag type="error" variation="low">
              Invalid
            </Tag>
          )
        },
      },
      goodPortion: {
        title: 'Successful Portion',
        minWidth: 100,
      },
    },
  }

  const [state, setState] = useState<{
    textInput: string
    lookupSet: Set<string>
    keyWords: Set<string>
    inputMapping: any
    ruleCharacters: any
    dateLengthRules: any
    validatedResult: Array<{
      userInput: string
      isValid: boolean
      goodPortion: string
    }>
  }>({
    textInput: props.settingsState.MerchantDictionary.reduce(
      (prev: any, curr: any) => {
        return { userInput: `${prev.userInput}\n${curr.userInput}` }
      }
    ).userInput,
    lookupSet: new Set([
      'currency',
      'card',
      'devicefingerprint',
      'installments',
      'installmentsinterestrate',
      'installmentsvalue',
      'ipaddress',
      'merchantname',
      'orderid',
      'paymentid',
    ]),
    keyWords: new Set(['Pad', 'date']),
    inputMapping: {},
    ruleCharacters: { '{': '}', '}': '{' },
    dateLengthRules: {
      d: 2,
      M: 2,
      y: 4,
    },
    validatedResult: props.settingsState.MerchantDictionary ?? [],
  })

  const isValidPadding = (paddingString: string, keyword: string) => {
    if (keyword !== 'Pad' || paddingString.length === 0) {
      return false
    }

    const splitPaddingString = paddingString.split(':')

    if (splitPaddingString.length === 1) {
      return true
    }

    if (
      splitPaddingString.length === 2 &&
      splitPaddingString[1].length === 1 &&
      splitPaddingString[0].match('^\\d+$') &&
      splitPaddingString[0].length > 0 &&
      splitPaddingString[0].length < 3
    ) {
      return true
    }

    return false
  }

  // Checks if dates are the correct format
  // dd//MM/yyyy or any subset of it
  const isValidDate = (dateString: string, keyword: string) => {
    if (keyword !== 'date' || dateString.length === 0) {
      return false
    }

    const dateArr: string[] = dateString.split('/')

    if (dateArr.length > 3) {
      return false
    }

    let isValidDateString = false

    for (const dateField of dateArr) {
      if (
        dateField.length > 0 &&
        dateField.charAt(0) in state.dateLengthRules &&
        dateField.split(dateField.charAt(0)).length - 1 === dateField.length &&
        dateField.length <= state.dateLengthRules[dateField.charAt(0)]
      ) {
        isValidDateString = true
      } else {
        isValidDateString = false
        break
      }
    }

    return isValidDateString
  }

  const validateInputMap = (textInput: string) => {
    setState({ ...state, textInput })

    const textInputArr = textInput.split('\n')

    const validatedResult = []

    for (const text of textInputArr) {
      let goodPortion = ''
      const stack: string[] = []

      for (const char of text) {
        // If there is no opening bracket, just add to it
        if (stack.length === 0 && !(char in state.ruleCharacters)) {
          goodPortion += char
        } else if (stack.length < 2 && char === '{') {
          // If there is an opening bracket
          stack.push(char)
          goodPortion += char
        } else if (stack.length >= 1 && char === '}') {
          // If there is a closing bracket
          // Pops the whole word, if there are no pipe between two sets of brackets
          if (state.lookupSet.has(stack[stack.length - 1])) {
            const poppedWord: string = stack.pop() ?? ''

            goodPortion += poppedWord
          } else {
            const splitBracketString = stack[stack.length - 1].split('|')

            if (
              splitBracketString.length === 3 &&
              (state.lookupSet.has(splitBracketString[0]) ||
                splitBracketString[0].length === 0) &&
              state.keyWords.has(splitBracketString[1]) &&
              (isValidPadding(splitBracketString[2], splitBracketString[1]) ||
                isValidDate(splitBracketString[2], splitBracketString[1]))
            ) {
              const poppedWord: string = stack.pop() ?? ''

              goodPortion += poppedWord
            }
          }

          // Pops the bottom layer bracket
          if (stack[stack.length - 1] === '{') {
            stack.pop()
            goodPortion += '}'
          }
        } else if (
          stack[0] === stack[1] &&
          stack[0] === '{' &&
          !(char in state.ruleCharacters)
        ) {
          // Adds to the stack if there are previous brackets, otherwise, append to it
          stack.length === 2
            ? stack.push(char)
            : (stack[stack.length - 1] += char)
        }
      }

      validatedResult.push({
        userInput: text,
        goodPortion,
        isValid: stack.length === 0,
      })
    }

    setState({ ...state, validatedResult })
  }

  return (
    <div>
      <div className="mb6">
        <div>
          {Array.from(state.lookupSet).map((keyword: string) => {
            return (
              <Tag type="success" key={keyword}>
                {keyword}
              </Tag>
            )
          })}
        </div>
        <Textarea
          label="Merchant Defined Information"
          onChange={(e: any) => {
            validateInputMap(e.target.value)
            props.setSettingsState({
              ...props.settingsState,
              MerchantDictionary: state.validatedResult,
            })
          }}
        >
          {state.textInput}
        </Textarea>
        <div className="mb5">
          <Table
            fullWidth
            schema={defaultSchema}
            items={state.validatedResult}
            density="high"
          />
        </div>
      </div>
      <Button
        variation="primary"
        onClick={() => {
          props.handleSaveSettings(props.showToast)
        }}
        isLoading={props.settingsLoading}
      >
        <FormattedMessage id="admin/cybersource.saveSettings.buttonText" />
      </Button>
    </div>
  )
}

export default MerchantDictionary
