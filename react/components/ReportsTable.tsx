import React, { useEffect } from 'react'
import {
  useDataGridState,
  useDataViewState,
  DataGrid,
  DataView,
} from '@vtex/admin-ui'
import { defineMessages, useIntl } from 'react-intl'

import type { ReportsTableProps } from '../types'

const messages = defineMessages({
  conversionTime: {
    defaultMessage: 'Conversion Time',
    id: 'admin/cybersource.settings.reports.conversionTime.label',
  },
  merchantReferenceNumber: {
    defaultMessage: 'Merchant Reference Number',
    id: 'admin/cybersource.settings.reports.merchantReferenceNumber.label',
  },
  newDecision: {
    defaultMessage: 'New Decision',
    id: 'admin/cybersource.settings.reports.newDecision.label',
  },
  originalDecision: {
    defaultMessage: 'Original Decision',
    id: 'admin/cybersource.settings.reports.originalDecision.label',
  },
  reviewer: {
    defaultMessage: 'Reviewer',
    id: 'admin/cybersource.settings.reports.reviewer.label',
  },
  reviewerComments: {
    defaultMessage: 'Reviewer Comments',
    id: 'admin/cybersource.settings.reports.reviewerComments.label',
  },
  noReports: {
    defaultMessage: 'There is no reports here!',
    id: 'admin/cybersource.settings.reports.noReports.label',
  },
})

const ReportsTable = ({ reports, loading }: ReportsTableProps) => {
  const { formatMessage } = useIntl()
  const view = useDataViewState()
  const state = useDataGridState({
    view,
    length: 6,
    columns: [
      {
        id: 'conversionTime',
        header: () => <strong>{formatMessage(messages.conversionTime)}</strong>,
      },
      {
        id: 'merchantReferenceNumber',
        header: () => (
          <strong>{formatMessage(messages.merchantReferenceNumber)}</strong>
        ),
      },
      {
        id: 'newDecision',
        header: () => <strong>{formatMessage(messages.newDecision)}</strong>,
      },
      {
        id: 'originalDecision',
        header: () => (
          <strong>{formatMessage(messages.originalDecision)}</strong>
        ),
      },
      {
        id: 'reviewer',
        header: () => <strong>{formatMessage(messages.reviewer)}</strong>,
      },
      {
        id: 'reviewerComments',
        header: () => (
          <strong>{formatMessage(messages.reviewerComments)}</strong>
        ),
      },
    ],
    items: reports,
  })

  useEffect(() => {
    if (loading) {
      view.setStatus({
        type: 'loading',
      })
    }

    if (reports.length === 0 && !loading) {
      view.setStatus({
        type: 'empty',
        message: formatMessage(messages.noReports),
      })
    }

    if (reports.length > 0 && !loading) {
      view.setStatus({
        type: 'ready',
      })
    }
  }, [loading])

  return (
    <DataView state={view}>
      <DataGrid state={state} />
    </DataView>
  )
}

export default ReportsTable
