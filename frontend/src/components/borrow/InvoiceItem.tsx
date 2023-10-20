import React from 'react'
import { InvoiceType } from '../types/invoice.type'
import { Card, CardBody, Chip } from '@nextui-org/react'



const InvoiceItem = (invoice: InvoiceType) => {
  return (
    <Card className='bg-default-100/50 hover:scale-[1.01] ease-out hover:border-primary hover:border'>
      <CardBody>
        <h6 className='font-medium font-heading text-lg'>
          {invoice.contract.title}

          {invoice.status === 'Paid' && <Chip variant='dot'/>}
          </h6>
      </CardBody>
    </Card>
  )
}

export default InvoiceItem