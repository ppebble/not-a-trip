/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react'
import { QualityReportForm } from '../QualityReportForm'

const mockMutateAsync = jest.fn()

jest.mock('@/hooks/useQualityReport', () => ({
  useQualityReportSummary: jest.fn(() => ({
    data: {
      countsByType: { duplicate: 2, closed_permanently: 1 },
      recentReports: [
        {
          id: 'QUALITY-001',
          reportType: 'duplicate',
          description: '중복으로 보여요',
          createdAt: new Date('2026-05-27T00:00:00.000Z'),
        },
      ],
    },
  })),
  useCreateQualityReport: jest.fn(() => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    error: null,
  })),
}))

describe('QualityReportForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockMutateAsync.mockResolvedValue(undefined)
  })

  test('renders existing summary and submits selected report type', async () => {
    render(<QualityReportForm spotId="SPOT-001" />)

    expect(screen.getByText('기존 신고 요약')).toBeInTheDocument()
    expect(screen.getByText(/중복 스팟 2건/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /중복 스팟/ }))
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '같은 장소가 이미 등록되어 있습니다.' },
    })
    fireEvent.click(screen.getByRole('button', { name: '품질 신고' }))

    expect(mockMutateAsync).toHaveBeenCalledWith({
      reportType: 'duplicate',
      description: '같은 장소가 이미 등록되어 있습니다.',
    })
    expect(
      await screen.findByText('품질 신고가 접수되었습니다.')
    ).toBeInTheDocument()
  })
})
