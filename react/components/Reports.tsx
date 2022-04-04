/* eslint-disable no-console */
import React, { useState, useEffect } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useApolloClient } from 'react-apollo'
import { createSystem } from '@vtex/admin-ui'
import { DatePicker } from 'vtex.styleguide'

import type { Report } from '../types'
import ReportsTable from './ReportsTable'
import reportsQuery from '../queries/reports.gql'

const messages = defineMessages({
  reportsDay: {
    defaultMessage: 'Reports Day',
    id: 'admin/cybersource.settings.reports.reportsDay.label',
  },
  reports: {
    defaultMessage: 'Reports',
    id: 'admin/cybersource.settings.reports.reports.label',
  },
})

const Reports = () => {
  const [SystemProvider] = createSystem({ key: 'cybersource' })
  const client = useApolloClient()
  const { formatDate, formatMessage } = useIntl()
  const [state, setState] = useState({
    selectedDay: new Date(),
    loading: true,
    reports: [],
  })

  const handleChange = (date: any) => {
    setState(prev => ({
      ...prev,
      selectedDay: date,
      reports: [],
    }))
  }

  useEffect(() => {
    setState(prev => ({
      ...prev,
      loading: true,
    }))
    const { selectedDay } = state
    const nextDay = new Date(selectedDay.getTime() + 24 * 60 * 60 * 1000)
    const formatedDate = formatDate(selectedDay, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

    const nextfdayFormatedDate = formatDate(nextDay, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

    console.log('date::', selectedDay)
    console.log('nextDay::', nextDay)
    console.log('formatedDate::', formatedDate)
    console.log('nextDayFormatedDate::', nextfdayFormatedDate)

    // last report: 03/17/2022
    client
      .query({
        query: reportsQuery,
        variables: {
          startDate: formatedDate,
          endDate: nextfdayFormatedDate,
        },
      })
      .then((response: any) => {
        console.log('report::', response)
        const reports =
          response?.data?.conversionReport?.conversionDetails ?? []

        setState(prev => ({
          ...prev,
          loading: false,
          reports: reports.map((report: Report) => ({
            ...report,
            conversionTime: formatDate(report.conversionTime, {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            }),
          })),
        }))
      })
      .catch((err: any) => {
        console.log('no reports:', err)
        setState(prev => ({
          ...prev,
          loading: false,
        }))
      })
  }, [state.selectedDay])

  return (
    <SystemProvider>
      <div className="mb5">
        <DatePicker
          label={formatMessage(messages.reportsDay)}
          value={state.selectedDay}
          onChange={(date: any) => handleChange(date)}
          locale="en-US"
        />
      </div>
      <div className="mb5">
        <ReportsTable reports={state.reports} loading={state.loading} />
      </div>
    </SystemProvider>
  )
}

export default Reports
