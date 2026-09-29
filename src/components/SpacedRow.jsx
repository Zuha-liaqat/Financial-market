import { Children, Fragment } from 'react'

// Table row for a `table-even-gaps` table: every column hugs its content and the
// leftover width is split into equal gaps, so the space between columns is even.
export default function SpacedRow({ children, header = false, ...props }) {
  const cells = Children.toArray(children)
  const Spacer = header ? 'th' : 'td'
  const width = `${100 / Math.max(cells.length - 1, 1)}%`
  return (
    <tr {...props}>
      {cells.map((cell, i) => (
        <Fragment key={cell.key}>
          {i > 0 && <Spacer aria-hidden="true" className="table-gap p-0" style={{ width }} />}
          {cell}
        </Fragment>
      ))}
    </tr>
  )
}
