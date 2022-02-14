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
    keyWords: new Set(['Pad', 'date']),
    inputMapping: {},
    ruleCharacters: { '{': '}', '}': '{' },
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
            splitBracketString[2].length > 0
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
        // Push to stack if it is either {{ or |
        // if (stack.length === 2 || stack[stack.length - 1] === '|') {
        //   stack.push(char)
        // } else if (stack[stack.length - 1] !== '|') {
        //   stack[stack.length - 1] += char
        // }
        if (stack.length === 2) {
          stack.push(char)
        } else {
          stack[stack.length - 1] += char
        }
      }
      // } else if (stack[0] === stack[1] && stack[0] === '{' && char === '|') {
      //   if (state.lookupSet.has(stack[stack.length - 1])) {
      //     const poppedWord: string = stack.pop() ?? ''

      //     goodPortion += poppedWord
      //   }

      //   if (stack[stack.length - 1] !== '|') {
      //     stack.push('|')
      //   } else {
      //     stack.pop()
      //   }
      // }
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
