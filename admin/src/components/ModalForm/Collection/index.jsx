import React, { useState, useCallback } from 'react';

import { useIntl } from 'react-intl';
import { isEmpty } from 'lodash/fp';

import {
  Grid,
  GridItem,
  Select,
  Option,
  Checkbox,
  Combobox,
  ComboboxOption,
  TextInput,
} from '@strapi/design-system';

import SelectContentTypes from '../../SelectContentTypes';

import form from '../mapper';
import SelectLanguage from '../../SelectLanguage';

const CollectionForm = (props) => {
  const { formatMessage } = useIntl();
  const [tmpValue, setTmpValue] = useState(null);

  const {
    contentTypes,
    allowedFields,
    onChange,
    onCancel,
    id,
    modifiedState,
    uid,
    setUid,
    langcode,
    setLangcode,
    patternInvalid,
    setPatternInvalid,
  } = props;

  const handleSelectChange = (contentType, lang = 'und') => {
    setLangcode(lang);
    setUid(contentType);
    onCancel(false);
  };

  const patternHint = () => {
    const base = formatMessage({ id: 'sitemap.Settings.Field.Pattern.DescriptionPart1', defaultMessage: 'Create a dynamic URL pattern' });
    let suffix = '';
    if (allowedFields[uid]) {
      suffix = ` ${formatMessage({ id: 'sitemap.Settings.Field.Pattern.DescriptionPart2', defaultMessage: 'using' })} `;
      allowedFields[uid].map((fieldName, i) => {
        if (i === 0) {
          suffix = `${suffix}[${fieldName}]`;
        } else if (allowedFields[uid].length !== i + 1) {
          suffix = `${suffix}, [${fieldName}]`;
        } else {
          suffix = `${suffix} ${formatMessage({ id: 'sitemap.Settings.Field.Pattern.DescriptionPart3', defaultMessage: 'and' })} [${fieldName}]`;
        }
      });
    }

    return base + suffix;
  };

  const dropdownIsOpened = useCallback((value) => {
    if (value.endsWith('[')) return true;
    if ((value.match(/\[/g) || []).length > (value.match(/\]/g) || []).length) return true;
    return false;
  });

  return (
    <form>
      <Grid gap={6}>
        <GridItem col={6} s={12}>
          <Grid gap={4}>
            <GridItem col={12}>
              <TextInput
                label={formatMessage({ id: 'sitemap.Settings.Field.Title.Label', defaultMessage: 'Title' })}
                name="title"
                required
                value={modifiedState.getIn([uid, 'languages', langcode, 'title'], '')}
                hint={formatMessage({ id: 'sitemap.Settings.Field.Title.Description', defaultMessage: 'Title of the bundle.' })}
                onChange={(e) => onChange(uid, langcode, 'title', e.target.value)}
              />
            </GridItem>
            <GridItem col={12}>
              <SelectContentTypes
                contentTypes={contentTypes}
                onChange={(value) => handleSelectChange(value)}
                value={uid}
                disabled={!isEmpty(id)}
                modifiedContentTypes={modifiedState}
              />
            </GridItem>
            <GridItem col={12}>
              <SelectLanguage
                contentType={contentTypes[uid]}
                onChange={(value) => handleSelectChange(uid, value)}
                value={langcode}
              />
            </GridItem>
            <GridItem col={12}>

              <TextInput
                label={formatMessage({ id: 'sitemap.Settings.Field.Filter.Label', defaultMessage: 'Additional filters' })}
                name="filter"
                value={modifiedState.getIn([uid, 'languages', langcode, 'filter'], '')}
                hint={formatMessage({ id: 'sitemap.Settings.Field.Filter.Description', defaultMessage: 'Add additional filters to the content type.' })}
                onChange={(e) => onChange(uid, langcode, 'filter', e.target.value)}
              />
            </GridItem>

            <GridItem col={12}>
              <TextInput
                label={formatMessage({ id: 'sitemap.Settings.Field.MaxAge.Label', defaultMessage: 'Max age of items (ms)' })}
                name="maxAge"
                value={modifiedState.getIn([uid, 'languages', langcode, 'maxAge'], '')}
                hint={formatMessage({ id: 'sitemap.Settings.Field.MaxAge.Description', defaultMessage: 'Define the maximum age of an item in milliseconds.' })}
                onChange={(e) => onChange(uid, langcode, 'maxAge', e.target.value)}
              />
            </GridItem>

            <GridItem col={12}>
              <TextInput
                label={formatMessage({ id: 'sitemap.Settings.Field.MinAge.Label', defaultMessage: 'Min age of items (ms)' })}
                name="minAge"
                value={modifiedState.getIn([uid, 'languages', langcode, 'minAge'], '')}
                hint={formatMessage({ id: 'sitemap.Settings.Field.MinAge.Description', defaultMessage: 'Define the minimum age of an item in milliseconds.' })}
                onChange={(e) => onChange(uid, langcode, 'minAge', e.target.value)}
              />
            </GridItem>
          </Grid>
        </GridItem>
        <GridItem col={6} s={12}>
          <Grid gap={4}>
            <GridItem col={12}>
              <Combobox
                autocomplete="both"
                placeholder="/en/pages/[id]"
                required
                disabled={!uid || (contentTypes[uid].locales && !langcode)}
                name="pattern"
                label={formatMessage({ id: 'sitemap.Settings.Field.Pattern.Label', defaultMessage: 'Pattern' })}
                error={patternInvalid.invalid ? patternInvalid.message : ''}
                hint={patternHint()}
                onChange={(v) => {
                  if (modifiedState.getIn([uid, 'languages', langcode, 'pattern'], '') === v) return;
                  const lastIndex = modifiedState.getIn([uid, 'languages', langcode, 'pattern'], '').lastIndexOf('[');
                  onChange(uid, langcode, 'pattern', `${modifiedState.getIn([uid, 'languages', langcode, 'pattern'], '').slice(0, lastIndex)}[${v}]`);
                  setTmpValue(null);
                }}
                onInputChange={(e) => {
                  if (e.target.value.match(/^[A-Za-z0-9-_.~[\]/]*$/)) {
                    onChange(uid, langcode, 'pattern', e.target.value);
                    setPatternInvalid({ invalid: false });

                    if (dropdownIsOpened(e.target.value)) {
                      if (!tmpValue) {
                        const lastIndex = e.target.value.lastIndexOf('[');
                        setTmpValue(`${e.target.value.slice(0, lastIndex)}[`);
                      }
                    } else {
                      setTmpValue(null);
                    }
                  }
                }}
                textValue={modifiedState.getIn([uid, 'languages', langcode, 'pattern'], '')}
                allowCustomValue
                open={() => dropdownIsOpened(modifiedState.getIn([uid, 'languages', langcode, 'pattern'], ''))}
              >
                {allowedFields[uid]?.map((fieldName) => (
                  <ComboboxOption
                    value={fieldName}
                    key={fieldName}
                  >
                    <span style={{ display: 'none' }}>{tmpValue}</span>{fieldName}
                  </ComboboxOption>
                ))}
              </Combobox>
            </GridItem>
            {Object.keys(form).map((input) => (
              <GridItem col={12} key={input}>
                <Select
                  name={input}
                  label={formatMessage({ id: `sitemap.Settings.Field.${input.replace(/^\w/, (c) => c.toUpperCase())}.Label`, defaultMessage: input.replace(/^\w/, (c) => c.toUpperCase()) })}
                  hint={formatMessage({ id: `sitemap.Settings.Field.${input.replace(/^\w/, (c) => c.toUpperCase())}.Description`, defaultMessage: '' })}
                  disabled={!uid || (contentTypes[uid].locales && !langcode)}
                  onChange={(value) => onChange(uid, langcode, input, value)}
                  value={modifiedState.getIn([uid, 'languages', langcode, input], form[input].value)}
                >
                  {form[input].options.map((option) => (
                    <Option value={option} key={option}>{option}</Option>
                  ))}
                </Select>
              </GridItem>
            ))}
            <GridItem col={12}>
              <Checkbox
                onValueChange={(cbValue) => {
                  onChange(uid, langcode, 'includeLastmod', cbValue);
                }}
                value={modifiedState.getIn([uid, 'languages', langcode, 'includeLastmod'], true)}
                disabled={!uid || (contentTypes[uid].locales && !langcode)}
                hint={formatMessage({ id: 'sitemap.Settings.Field.IncludeLastmod.Description', defaultMessage: 'Adds a <lastmod> tag to all the URLs of this type.' })}
              >
                {formatMessage({ id: 'sitemap.Settings.Field.IncludeLastmod.Label', defaultMessage: 'Lastmod' })}
              </Checkbox>
            </GridItem>

            <GridItem col={12}>
              <Checkbox
                onValueChange={(cbValue) => {
                  onChange(uid, langcode, 'addNews', cbValue);
                }}
                value={modifiedState.getIn([uid, 'languages', langcode, 'addNews'], false)}
                disabled={!uid || (contentTypes[uid].locales && !langcode)}
                hint={formatMessage({ id: 'sitemap.Settings.Field.AddNews.Description', defaultMessage: 'Adds a News object to all the URLs of this type.' })}
              >
                {formatMessage({ id: 'sitemap.Settings.Field.AddNews.Label', defaultMessage: 'Add News' })}
              </Checkbox>
            </GridItem>

            <GridItem col={12}>
              <TextInput
                label={formatMessage({ id: 'sitemap.Settings.Field.NewsTitleField.Label', defaultMessage: 'Title field for News' })}
                name="newsTitleField"
                value={modifiedState.getIn([uid, 'languages', langcode, 'newsTitleField'], '')}
                hint={formatMessage({ id: 'sitemap.Settings.Field.NewsTitleField.Description', defaultMessage: 'Field to use to set the field title in news.publication.' })}
                onChange={(e) => onChange(uid, langcode, 'newsTitleField', e.target.value)}
              />
            </GridItem>
          </Grid>
        </GridItem>
      </Grid>
    </form>
  );
};

export default CollectionForm;
