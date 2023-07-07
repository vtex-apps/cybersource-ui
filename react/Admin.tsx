/* eslint-disable @typescript-eslint/no-unused-vars */
// react/adminExample.tsx
import type { FC } from 'react'
import React, { useState, useEffect } from 'react'
import {
  ToastProvider,
  ToastConsumer,
  Layout,
  PageHeader,
  PageBlock,
  Button,
  Toggle,
  Input,
  Dropdown,
  Spinner,
  Tab,
  Tabs,
} from 'vtex.styleguide'
import { FormattedMessage, useIntl } from 'react-intl'
import { Link } from 'vtex.render-runtime'
import { useQuery, useMutation } from 'react-apollo'

import MerchantDictionary from './components/merchantDictionary'
import Reports from './components/Reports'
import M_INIT_CONFIG from './mutations/InitConfiguration.gql'
import RemoveConfiguration from './mutations/RemoveConfiguration.gql'
import AppSettings from './queries/appSettings.gql'
import SaveAppSettings from './mutations/saveAppSettings.gql'

const Admin: FC = () => {
  const { formatMessage } = useIntl()
  const [saveSettings] = useMutation(SaveAppSettings)
  const [initConfig] = useMutation(M_INIT_CONFIG)
  const [removeConfig] = useMutation(RemoveConfiguration)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsState, setSettingsState] = useState({
    IsLive: false,
    MerchantId: '',
    MerchantKey: '',
    SharedSecretKey: '',
    Processor: '',
    Region: '',
    OrderSuffix: '',
    CustomNsu: '',
    EnableTransactionPosting: false,
    SalesChannelExclude: '',
    ShippingProductCode: '',
    NexusRegions: '',
    EnableTax: false,
    MerchantDictionary: [],
    UseOrderIdForFingerprint: false,
  })

  const [initialAdminState, setAdminState] = useState({
    currentTab: 1,
  })

  const { data } = useQuery(AppSettings, {
    variables: {
      version: process.env.VTEX_APP_VERSION,
    },
    ssr: false,
  })

  const processorOptions = [
    { value: 'Braspag', label: 'Braspag' },
    { value: 'VPC', label: 'VPC' },
    { value: 'Izipay', label: 'Izipay' },
    { value: 'eGlobal', label: 'eGlobal' },
    { value: 'BBVA', label: 'BBVA' },
    { value: 'Banorte', label: 'Banorte' },
    { value: 'Prosa', label: 'Prosa' },
    { value: 'Santander', label: 'Santander' },
    { value: 'Amex Direct', label: 'American Express Direct' },
    { value: 'Other', label: 'Other' },
  ]

  const regionOptions = [
    { value: 'CO', label: 'Colombia' },
    { value: 'PE', label: 'Peru' },
    { value: 'MX', label: 'Mexico' },
    { value: 'BR', label: 'Brasil' },
    { value: 'EC', label: 'Ecuador' },
    { value: 'Other', label: 'Other' },
  ]

  const handleSaveSettings = async (showToast: any) => {
    setSettingsLoading(true)

    try {
      if (settingsState.EnableTax) {
        await initConfig()
      } else {
        await removeConfig()
      }

      await saveSettings({
        variables: {
          version: process.env.VTEX_APP_VERSION,
          settings: JSON.stringify(settingsState),
        },
      }).then(() => {
        showToast({
          message: formatMessage({
            id: 'admin/cybersource.saveSettings.success',
          }),
          duration: 5000,
        })
        setSettingsLoading(false)
      })
    } catch (error) {
      console.error(error)
      showToast({
        message: formatMessage({
          id: 'admin/cybersource.saveSettings.failure',
        }),
        duration: 5000,
      })
      setSettingsLoading(false)
    }
  }

  useEffect(() => {
    if (!data?.getAppSettings) return

    setSettingsState({
      ...settingsState,
      CustomNsu: data.getAppSettings.customNsu,
      EnableTax: data.getAppSettings.enableTax,
      EnableTransactionPosting: data.getAppSettings.enableTrasactionPosting,
      IsLive: data.getAppSettings.isLive,
      MerchantId: data.getAppSettings.merchantId,
      MerchantKey: data.getAppSettings.merchantKey,
      NexusRegions: data.getAppSettings.nexusRegions,
      OrderSuffix: data.getAppSettings.orderSuffix,
      Processor: data.getAppSettings.processor,
      Region: data.getAppSettings.region,
      SalesChannelExclude: data.getAppSettings.salesChannelExclude,
      SharedSecretKey: data.getAppSettings.sharedSecretKey,
      ShippingProductCode: data.getAppSettings.shippingProductCode,
      MerchantDictionary: data.getAppSettings.merchantDictionary,
      UseOrderIdForFingerprint: data.getAppSettings.useOrderIdForFingerprint,
    })
  }, [data])

  if (!data) {
    return (
      <Layout
        pageHeader={
          <PageHeader
            title={<FormattedMessage id="admin/cybersource.title" />}
          />
        }
        fullWidth
      >
        <PageBlock>
          <Spinner />
        </PageBlock>
      </Layout>
    )
  }

  return (
    <ToastProvider positioning="window">
      <ToastConsumer>
        {({ showToast }: { showToast: any }) => (
          <Layout
            pageHeader={
              <PageHeader
                title={<FormattedMessage id="admin/cybersource.title" />}
              />
            }
            fullWidth
          >
            <div>
              <Tabs fullWidth>
                <Tab
                  label="Admin Settings"
                  active={initialAdminState.currentTab === 1}
                  onClick={() => setAdminState({ currentTab: 1 })}
                >
                  <div className="pt7">
                    <PageBlock
                      subtitle={
                        <FormattedMessage
                          id="admin/cybersource.settings.introduction"
                          values={{
                            cybersourceLink: (
                              // eslint-disable-next-line react/jsx-no-target-blank
                              <Link
                                to="https://www.cybersource.com/"
                                target="_blank"
                              >
                                https://www.cybersource.com/
                              </Link>
                            ),
                            lineBreak: <br />,
                          }}
                        />
                      }
                    >
                      <section className="pv4">
                        <Toggle
                          semantic
                          label={formatMessage({
                            id: 'admin/cybersource.settings.isLive.label',
                          })}
                          size="large"
                          checked={settingsState.IsLive}
                          onChange={() => {
                            setSettingsState({
                              ...settingsState,
                              IsLive: !settingsState.IsLive,
                            })
                          }}
                          helpText={formatMessage({
                            id: 'admin/cybersource.settings.isLive.helpText',
                          })}
                        />
                      </section>
                      <section className="pb4 mt4">
                        <Input
                          label={formatMessage({
                            id: 'admin/cybersource.settings.merchantId.label',
                          })}
                          value={settingsState.MerchantId}
                          onChange={(e: React.FormEvent<HTMLInputElement>) =>
                            setSettingsState({
                              ...settingsState,
                              MerchantId: e.currentTarget.value,
                            })
                          }
                          helpText={formatMessage({
                            id: 'admin/cybersource.settings.merchantId.helpText',
                          })}
                        />
                      </section>
                      <section className="pb4 mt4">
                        <Input
                          label={formatMessage({
                            id: 'admin/cybersource.settings.merchantKey.label',
                          })}
                          value={settingsState.MerchantKey}
                          onChange={(e: React.FormEvent<HTMLInputElement>) =>
                            setSettingsState({
                              ...settingsState,
                              MerchantKey: e.currentTarget.value,
                            })
                          }
                          helpText={formatMessage({
                            id: 'admin/cybersource.settings.merchantKey.helpText',
                          })}
                        />
                      </section>
                      <section className="pb4 mt4">
                        <Input
                          label={formatMessage({
                            id: 'admin/cybersource.settings.sharedSecretKey.label',
                          })}
                          value={settingsState.SharedSecretKey}
                          onChange={(e: React.FormEvent<HTMLInputElement>) =>
                            setSettingsState({
                              ...settingsState,
                              SharedSecretKey: e.currentTarget.value,
                            })
                          }
                          helpText={formatMessage({
                            id: 'admin/cybersource.settings.sharedSecretKey.helpText',
                          })}
                        />
                      </section>
                      <section className="mb5">
                        <Dropdown
                          label="Processor"
                          options={processorOptions}
                          value={settingsState.Processor}
                          onChange={(e: React.FormEvent<HTMLInputElement>) =>
                            setSettingsState({
                              ...settingsState,
                              Processor: e.currentTarget.value,
                            })
                          }
                        />
                      </section>
                      <section className="mb5">
                        <Dropdown
                          label="Region"
                          options={regionOptions}
                          value={settingsState.Region}
                          onChange={(e: React.FormEvent<HTMLInputElement>) =>
                            setSettingsState({
                              ...settingsState,
                              Region: e.currentTarget.value,
                            })
                          }
                        />
                      </section>
                      <section className="pb4 mt4">
                        <Input
                          label={formatMessage({
                            id: 'admin/cybersource.settings.orderSuffix.label',
                          })}
                          value={settingsState.OrderSuffix}
                          onChange={(e: React.FormEvent<HTMLInputElement>) =>
                            setSettingsState({
                              ...settingsState,
                              OrderSuffix: e.currentTarget.value,
                            })
                          }
                          helpText={formatMessage({
                            id: 'admin/cybersource.settings.orderSuffix.helpText',
                          })}
                        />
                      </section>
                      <section className="pb4 mt4">
                        <Input
                          label={formatMessage({
                            id: 'admin/cybersource.settings.customNsu.label',
                          })}
                          value={settingsState.CustomNsu}
                          onChange={(e: React.FormEvent<HTMLInputElement>) =>
                            setSettingsState({
                              ...settingsState,
                              CustomNsu: e.currentTarget.value,
                            })
                          }
                          helpText={formatMessage({
                            id: 'admin/cybersource.settings.customNsu.helpText',
                          })}
                        />
                      </section>
                      <section className="pv4">
                        <Toggle
                          semantic
                          label={formatMessage({
                            id: 'admin/cybersource.settings.UseOrderIdForFingerprint.label',
                          })}
                          size="large"
                          checked={settingsState.UseOrderIdForFingerprint}
                          onChange={() => {
                            setSettingsState({
                              ...settingsState,
                              UseOrderIdForFingerprint:
                                !settingsState.UseOrderIdForFingerprint,
                            })
                          }}
                          helpText={formatMessage({
                            id: 'admin/cybersource.settings.UseOrderIdForFingerprint.helpText',
                          })}
                        />
                      </section>
                      <section className="pv4">
                        <Toggle
                          semantic
                          label={formatMessage({
                            id: 'admin/cybersource.settings.EnableTax.label',
                          })}
                          size="large"
                          checked={settingsState.EnableTax}
                          onChange={() => {
                            setSettingsState({
                              ...settingsState,
                              EnableTax: !settingsState.EnableTax,
                            })
                          }}
                          helpText={formatMessage({
                            id: 'admin/cybersource.settings.EnableTax.helpText',
                          })}
                        />
                      </section>
                      <section className="pv4">
                        <Toggle
                          semantic
                          label={formatMessage({
                            id: 'admin/cybersource.settings.enableTransactionPosting.label',
                          })}
                          size="large"
                          checked={settingsState.EnableTransactionPosting}
                          onChange={() => {
                            setSettingsState({
                              ...settingsState,
                              EnableTransactionPosting:
                                !settingsState.EnableTransactionPosting,
                            })
                          }}
                          helpText={formatMessage({
                            id: 'admin/cybersource.settings.enableTransactionPosting.helpText',
                          })}
                        />
                      </section>
                      <section className="pb4 mt4">
                        <Input
                          label={formatMessage({
                            id: 'admin/cybersource.settings.salesChannelExclude.label',
                          })}
                          value={settingsState.SalesChannelExclude}
                          onChange={(e: React.FormEvent<HTMLInputElement>) =>
                            setSettingsState({
                              ...settingsState,
                              SalesChannelExclude: e.currentTarget.value,
                            })
                          }
                          helpText={formatMessage({
                            id: 'admin/cybersource.settings.salesChannelExclude.helpText',
                          })}
                        />
                      </section>
                      <section className="pb4 mt4">
                        <Input
                          label={formatMessage({
                            id: 'admin/cybersource.settings.shippingProductCode.label',
                          })}
                          value={settingsState.ShippingProductCode}
                          onChange={(e: React.FormEvent<HTMLInputElement>) =>
                            setSettingsState({
                              ...settingsState,
                              ShippingProductCode: e.currentTarget.value,
                            })
                          }
                          helpText={formatMessage({
                            id: 'admin/cybersource.settings.shippingProductCode.helpText',
                          })}
                        />
                      </section>
                      <section className="pb4 mt4">
                        <Input
                          label={formatMessage({
                            id: 'admin/cybersource.settings.nexusRegions.label',
                          })}
                          value={settingsState.NexusRegions}
                          onChange={(e: React.FormEvent<HTMLInputElement>) =>
                            setSettingsState({
                              ...settingsState,
                              NexusRegions: e.currentTarget.value,
                            })
                          }
                          helpText={formatMessage({
                            id: 'admin/cybersource.settings.nexusRegions.helpText',
                          })}
                        />
                      </section>
                      <section className="pt4">
                        <Button
                          variation="primary"
                          onClick={() => handleSaveSettings(showToast)}
                          isLoading={settingsLoading}
                        >
                          <FormattedMessage id="admin/cybersource.saveSettings.buttonText" />
                        </Button>
                      </section>
                    </PageBlock>
                  </div>
                </Tab>
                <Tab
                  label={formatMessage({
                    id: 'admin/cybersource.settings.merchantDefinedFields',
                  })}
                  active={initialAdminState.currentTab === 2}
                  onClick={() => setAdminState({ currentTab: 2 })}
                >
                  <div className="pt7">
                    <MerchantDictionary
                      handleSaveSettings={handleSaveSettings}
                      showToast={showToast}
                      settingsState={settingsState}
                      setSettingsState={setSettingsState}
                      settingsLoading={settingsLoading}
                    />
                  </div>
                </Tab>
                <Tab
                  label={formatMessage({
                    id: 'admin/cybersource.settings.reports.reports.label',
                  })}
                  active={initialAdminState.currentTab === 3}
                  onClick={() => setAdminState({ currentTab: 3 })}
                >
                  <div className="pt7">
                    <Reports />
                  </div>
                </Tab>
              </Tabs>
            </div>
          </Layout>
        )}
      </ToastConsumer>
    </ToastProvider>
  )
}

export default Admin
