import React, { useState, useEffect, useCallback } from 'react';
import { Paragraph, Stack, TextInput, Button } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';

const ParentPageField = () => {
  const sdk = useSDK();

  return <></>
}

const UrlBuilderField = () => {
  const sdk = useSDK();
  const currentLocale = sdk.field.locale

  const [domainField] = useState(sdk.entry.fields[sdk.parameters.instance.domainFieldId])
  const [domain, setDomain] = useState('')

  const [slugField] = useState(sdk.entry.fields[sdk.parameters.instance.slugFieldId])
  const [slug, setSlug] = useState(slugField[currentLocale])

  const [calculatedSlug, setCalculatedSlug] = useState(sdk.field.getValue())

  const fetchDomain = useCallback(async () => {
    if (domainField && domainField.getValue()) {
      let domainEntry = await sdk.space.getEntry(domainField.getValue(currentLocale).sys.id)
      setDomain(domainEntry.fields.slug[currentLocale])
    } else {
      setDomain('')
    }
  }, [domainField, currentLocale, sdk.space])

  const calculateDomainSlug = useCallback(async () => {
    await fetchDomain()
    return domain || 'pagina'
  }, [domain, fetchDomain])

  const calculateSlug = useCallback(async () => {
    let result = [await calculateDomainSlug(), slug].filter(Boolean).join('/')
    setCalculatedSlug(result)
    await sdk.field.setValue(result)
  }, [calculateDomainSlug, sdk.field, slug])

  useEffect(() => {
    domainField && domainField.onValueChanged(async (value) => {
      await fetchDomain()
      await calculateSlug()
    })

    slugField && slugField.onValueChanged(async (value) => {
      setSlug(value)
      await calculateSlug()
    })

    fetchDomain()
  }, [sdk.space, currentLocale, domainField, slugField, calculateSlug, fetchDomain])

  return (<>
    <Stack flexDirection="column">
      <TextInput.Group spacing="spacingS">
        <TextInput
          aria-label="Domain Slug"
          id="domain-slug"
          value={domain || ''}
          isDisabled
        />
        <Paragraph><b>/</b></Paragraph>
        <TextInput
          aria-label="Page Slug"
          id="page-slug"
          value={slug || ''}
          isDisabled
        />
        <Button onClick={calculateSlug}>Re-calculate</Button>
      </TextInput.Group>
    </Stack>
    <Paragraph><b>Calculated slug:</b> {calculatedSlug}</Paragraph>
  </>)
}

const Field = () => {
  const sdk = useSDK();

  sdk.window.startAutoResizer()

  switch(sdk.field.type) {
    case "Symbol": return <UrlBuilderField />
    case "Link": return <ParentPageField />
    default: return <Paragraph>Invalid Field Type</Paragraph>
  }
};

export default Field;
