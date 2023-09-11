import { Button, Page, Box, Text, Layout, Cell, Card, FormField, Input, NumberInput, ColorInput, ImageViewer } from '@wix/design-system';
import './App.css'
import { useState } from 'react';
import axios, { AxiosResponse } from 'axios'
import { openModal } from '@wix/dashboard-sdk';


function App() {
  const [amount, setAmount] = useState(1);
  const [content, setContent] = useState("text");
  const [color, setColor] = useState('#000000');

  const searchParams = new URLSearchParams(document.location.search)
  const token = searchParams.get('instance') || ""
  console.log("the token", token)
  console.log("the url", document.location.search)

  const [headerBase64, payloadBase64] = token.split('.');
  const payload = JSON.parse(atob(payloadBase64))
  console.log('Payload:', payload);
  const instanceID = payload.instanceId
  console.log(instanceID);


  async function updateHandler(amount: number, content: string, color: string) {
    const data = {
      settings: {
        amount: amount,
        content: content,
        color: color,
      },
      instanceID
    };

    try {
      const response: AxiosResponse = await axios.post('https://manage.wix.com/checkout-slots-idoy/settings', data);
      console.log("response.data",response.data)
    } catch (error) {
      // Handle the error
    }
  }

  return (

    <Page>
      <Page.Header
        title="Carbon Offset"
        subtitle={
          <Text secondary>
            Let your customers balance the carbon footprint of their order.      <Box inline paddingLeft="SP1">
            </Box>
          </Text>
        }
        actionsBar={
          
          <Box gap="12px">
            <Button onClick={() => updateHandler(amount, content, color)}>Update</Button>
            <Button onClick={() => {
              const slotConsentModalId = '346cce63-b26e-4846-b5df-00425e299caa';
              const componentParams = {
                  appDefinitionId: 'f1328fef-0e80-440d-8663-b17e7d4791a2',
                  widgetId: '502bffc5-1c0d-4807-a926-67b5011297c2',
                  slotName: 'checkout:summary:after'
                };

                openModal(slotConsentModalId, componentParams)

            }}>Inject Widget</Button>

          </Box>
        }


      />
      <Page.Content>
        <Layout>
          <Cell span={6}>
            <Card>
              <Card.Header
                title="Added price"
                subtitle="This appears on your checkout page."
              />
              <Card.Divider />
              <Card.Content>
                <Box direction="vertical" gap="4">
                  <form>
                    <Layout>
                      <Cell span={3}>
                        <FormField

                          labelSize="small"
                          label="Amount"
                          required
                        >
                          <NumberInput
                            onChange={e => { setAmount(e || 1) }}
                            prefix={<Input.Affix>$</Input.Affix>}
                            value={amount}
                          />
                        </FormField>
                      </Cell>
                      <Cell span={6}></Cell>
                    </Layout>
                  </form>
                  <Layout>
                    <Cell span={12}>
                      <FormField label="Content" required>
                        <Input value={content} onChange={(e) => { setContent(e.target.value) }} />
                      </FormField>
                    </Cell>

                    <Cell span={6} >
                      <FormField label="Text color">
                        <ColorInput

                          value={color}
                          onChange={(newColor) => {
                            setColor(newColor as string)

                          }}
                          popoverAppendTo="viewport"
                        />
                      </FormField>
                    </Cell>
                    <Cell span={6}></Cell>
                  </Layout>
                </Box>
              </Card.Content>
            </Card>
          </Cell>
          <Cell span={6}>
            <Card >
              <FormField label="Cover image">
                <ImageViewer imageUrl="https://velobrands.co.uk/wp-content/uploads/2016/04/Widget2-300x1501.jpg" height="218px" />
              </FormField>
            </Card>
          </Cell>
        </Layout>
      </Page.Content>
    </Page>
  )




}

export default App
