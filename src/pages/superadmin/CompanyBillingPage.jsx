import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCompanyById, updateCompany } from '../../data/companies'
import { subscriptionPlans } from '../../data/subscriptionPlans'

const statusStyles = {
  Active: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
  Trial: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
  Suspended: 'bg-red-50 text-red-600 ring-1 ring-red-200',
}

const invoiceStatusStyles = {
  Paid: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
  Failed: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  Pending: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export default function CompanyBillingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)

  useEffect(() => {
    setCompany(getCompanyById(id))
  }, [id])

  function handlePlanChange(planName) {
    const updated = updateCompany(id, { plan: planName })
    setCompany(updated)
  }

  function handleStatusToggle() {
    const nextStatus = company.status === 'Suspended' ? 'Active' : 'Suspended'
    const updated = updateCompany(id, { status: nextStatus })
    setCompany(updated)
  }

  if (!company) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-400">
        Company not found.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate('/super-admin/companies')}
        className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-black"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Companies
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${company.avatarColor}`}>
            {getInitials(company.name)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-black">{company.name}</h2>
            <p className="text-xs text-neutral-400">{company.id} · Joined {formatDate(company.joinedDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${statusStyles[company.status]}`}>
            {company.status}
          </span>
          <button
            onClick={handleStatusToggle}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              company.status === 'Suspended'
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            {company.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs font-semibold tracking-widest text-neutral-400">CURRENT PLAN</p>
          <p className="mt-1.5 text-2xl font-bold text-black">{company.plan}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs font-semibold tracking-widest text-neutral-400">USERS</p>
          <p className="mt-1.5 text-2xl font-bold text-black">{company.usersCount}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs font-semibold tracking-widest text-neutral-400">LIFETIME BILLED</p>
          <p className="mt-1.5 text-2xl font-bold text-black">
            ${company.billingHistory.reduce((sum, inv) => sum + (inv.status === 'Paid' ? inv.amount : 0), 0)}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <p className="mb-3 text-xs font-semibold tracking-widest text-neutral-400">CHANGE PLAN</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {subscriptionPlans.map((plan) => {
            const active = company.plan === plan.name
            return (
              <button
                key={plan.id}
                onClick={() => handlePlanChange(plan.name)}
                className={`flex flex-col items-start gap-1 rounded-lg border-2 p-3.5 text-left transition ${
                  active ? 'border-brand-500 bg-brand-50' : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <span className="text-sm font-bold text-black">{plan.name}</span>
                <span className="text-xs text-neutral-500">
                  {plan.price === 0 ? 'Free' : `$${plan.price}/${plan.billingCycle}`}
                </span>
                {active && (
                  <span className="mt-1 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white">Current</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-4 py-3.5">
          <p className="text-xs font-semibold tracking-widest text-neutral-400">BILLING HISTORY</p>
        </div>
        {company.billingHistory.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-400">No invoices yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-semibold tracking-widest text-neutral-400">
                  <th className="px-4 py-3">INVOICE</th>
                  <th className="px-3 py-3">DATE</th>
                  <th className="px-3 py-3">AMOUNT</th>
                  <th className="px-3 py-3">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {company.billingHistory.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-black">{invoice.id}</td>
                    <td className="px-3 py-3 text-neutral-500">{formatDate(invoice.date)}</td>
                    <td className="px-3 py-3 text-neutral-600">${invoice.amount}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${invoiceStatusStyles[invoice.status]}`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
