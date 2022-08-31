import type { FunctionComponent } from 'react'
import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-apollo'
import { FormattedMessage, useIntl } from 'react-intl'
import {
  Button,
  Collapsible,
  PageBlock,
  Table,
  Tag,
  Textarea,
  Link,
} from 'vtex.styleguide'

import MerchantDefinedFields from '../queries/merchantDefinedFields.gql'

const MerchantDictionary: FunctionComponent<any> = (props: any) => {
  const { formatMessage } = useIntl()

  const defaultSchema = {
    properties: {
      userInput: {
        title: formatMessage({
          id: 'admin/cybersource.settings.userInput',
        }),
        width: 300,
      },
      isValid: {
        title: formatMessage({
          id: 'admin/cybersource.settings.isValid',
        }),
        minWidth: 100,
        cellRenderer: ({ cellData }: any) => {
          return cellData ? (
            <Tag type="success" variation="low">
              {formatMessage({
                id: 'admin/cybersource.settings.valid',
              })}
            </Tag>
          ) : (
            <Tag type="error" variation="low">
              {formatMessage({
                id: 'admin/cybersource.settings.invalid',
              })}
            </Tag>
          )
        },
      },
      goodPortion: {
        title: formatMessage({
          id: 'admin/cybersource.settings.successfulPortion',
        }),
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
    isOpen: boolean
  }>({
    textInput:
      props?.settingsState?.MerchantDictionary?.length > 0
        ? props.settingsState.MerchantDictionary.reduce(
            (prev: any, curr: any) => {
              return { userInput: `${prev.userInput}\n${curr.userInput}` }
            }
          ).userInput
        : '',
    lookupSet: new Set([]),
    keyWords: new Set(['PAD', 'DATE', 'AGE', 'EQUALS']),
    inputMapping: {},
    ruleCharacters: { '{': '}', '}': '{' },
    dateLengthRules: {
      d: 2,
      M: 4,
      y: 4,
    },
    validatedResult: props.settingsState.MerchantDictionary ?? [],
    isOpen: false,
  })

  const { data } = useQuery(MerchantDefinedFields, {
    ssr: false,
  })

  useEffect(() => {
    if (data?.merchantDefinedFields.length > 0) {
      setState((prevState: any) => ({
        ...prevState,
        lookupSet: new Set(data.merchantDefinedFields),
      }))
    }
  }, [data])

  const validateInputMap = (textInput: string) => {
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
              state.keyWords.has(splitBracketString[1].toUpperCase())
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

    setState({ ...state, validatedResult, textInput })

    props.setSettingsState({
      ...props.settingsState,
      MerchantDictionary: state.validatedResult,
    })
  }

  return (
    <div>
      <div className="pa3 bg-muted-5">
        <PageBlock
          variation="annotated"
          title={formatMessage({
            id: 'admin/cybersource.settings.merchantFieldsReadme',
          })}
          subtitle={
            <Link
              target="_blank"
              href="https://developers.vtex.com/vtex-developer-docs/docs/vtex-cybersource-ui"
            >
              {formatMessage({
                id: 'admin/cybersource.settings.readmeLink',
              })}
            </Link>
          }
        >
          <div className="pv2">
            <FormattedMessage
              id="admin/cybersource.settings.readmeContent"
              values={{ lineBreak: <br /> }}
            />
          </div>
        </PageBlock>
      </div>
      <div className="mb6">
        <div className="pa3">
          <Collapsible
            header={
              <span className="c-action-primary hover-c-action-primary fw5">
                {formatMessage({
                  id: 'admin/cybersource.settings.showRefenceWords',
                })}
              </span>
            }
            onClick={(e: any) => {
              setState({ ...state, isOpen: e.target.isOpen })
            }}
            isOpen={state.isOpen}
          >
            {Array.from(state.lookupSet).map((keyword: string) => {
              return (
                <span key={keyword} className="pa3">
                  <Tag type="success" variation="low">
                    {keyword}
                  </Tag>
                </span>
              )
            })}
          </Collapsible>
        </div>
        <Textarea
          label={formatMessage({
            id: 'admin/cybersource.settings.merchantDefinedInfo',
          })}
          onChange={(e: any) => {
            validateInputMap(e.target.value)
          }}
          value={state.textInput}
        />
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
