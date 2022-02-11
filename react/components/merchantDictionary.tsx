import type { FunctionComponent } from 'react'
import React, { useState } from 'react'
import { Tag, Textarea } from 'vtex.styleguide'

const MerchantDictionary: FunctionComponent = () => {
  const [state, setState] = useState({
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
    inputMapping: {},
    ruleCharacters: { '{': '}', '}': '{', '|': '|' },
    isValid: true,
  })

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
        // Pops the whole word
        if (state.lookupSet.has(stack[stack.length - 1])) {
          const poppedWord: string = stack.pop() ?? ''

          goodPortion += poppedWord
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
        if (stack.length === 2) {
          stack[2] = char
        } else {
          stack[2] += char
        }
      }
    }

    // console.log(goodPortion)

    // console.log(stack)

    setState({ ...state, isValid: stack.length === 0 })
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
      </div>
    </div>
  )
}

export default MerchantDictionary
