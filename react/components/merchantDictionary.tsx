import type { FunctionComponent } from 'react'
import React, { useState } from 'react'
import { Tag, Textarea } from 'vtex.styleguide'

const MerchantDictionary: FunctionComponent = () => {
  const [state, setState] = useState<{
    textInput: string
    lookupSet: Set<string>
    keyWords: Set<string>
    inputMapping: any
    ruleCharacters: any
    dateLengthRules: any
    isValid: boolean
    goodPortion: string
  }>({
    textInput: '',
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
    isValid: true,
    goodPortion: '',
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

  const setDictionaryMap = (textInput: string) => {
    setState({ ...state, textInput })

    const stack: string[] = []

    let goodPortion = ''

    for (const char of textInput) {
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
            state.lookupSet.has(splitBracketString[0]) &&
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
        stack.length === 2
          ? stack.push(char)
          : (stack[stack.length - 1] += char)
      }
    }

    setState({ ...state, isValid: stack.length === 0, goodPortion })
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
            setDictionaryMap(e.target.value)
          }}
        >
          {state.textInput}
        </Textarea>
        <Tag type="success">{state.isValid.toString()}</Tag>
        <Tag type="success">{state.goodPortion}</Tag>
      </div>
    </div>
  )
}

export default MerchantDictionary
