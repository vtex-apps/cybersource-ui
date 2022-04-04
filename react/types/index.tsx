export interface Report {
  conversionTime: string
  merchantReferenceNumber: string
  newDecision: string
  originalDecision: string
  reviewer: string
  reviewerComments: string
}
export interface ReportsTableProps {
  reports: Report[]
  loading: boolean
}
export interface ReportsState {
  selectedDay: any
  loading: boolean
  reports: Report[]
}
