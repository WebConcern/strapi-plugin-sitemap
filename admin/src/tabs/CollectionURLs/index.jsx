import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Map } from 'immutable';

import {
  deleteContentType,
  discardModifiedBundleItems,
  onChangeBundleItems,
  submitModal,
} from '../../state/actions/Sitemap';
import List from '../../components/List/Collection';
import ModalForm from '../../components/ModalForm';

const CollectionURLs = () => {
  const state = useSelector((store) => store.get('sitemap', Map()));
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [index, setIndex] = useState(null);
  const [langcode, setLangcode] = useState('und');

  const handleModalSubmit = (e) => {
    e.preventDefault();
    dispatch(submitModal());
    setModalOpen(false);
    setIndex(null);
  };

  const handleModalOpen = (editIndex) => {
    if (editIndex) {
      setIndex(editIndex);
    } else {
      // Do we create a new item somewhere?
    }
    
    setModalOpen(true);
  };

  const handleModalClose = (closeModal = true) => {
    if (closeModal) {
      setModalOpen(false);
      setIndex(null);
    }
    dispatch(discardModifiedBundleItems());
  };

  // Loading state
  if (!state.getIn(['settings', 'bundleItems'])) {
    return null;
  }

  console.log(state.toJSON());

  return (
    <div>
      <List
        items={state.getIn(['settings', 'bundleItems'])}
        openModal={(editIndex) => handleModalOpen(editIndex)}
        onDelete={(key, lang) => dispatch(deleteContentType(key, lang))}
      />
      <ModalForm
        bundleItems={state.get('bundleItems')}
        allowedFields={state.get('allowedFields')}
        modifiedState={state.get('modifiedBundleItems')}
        onSubmit={(e) => handleModalSubmit(e)}
        onCancel={(closeModal) => handleModalClose(closeModal)}
        onChange={(index, key, value) => dispatch(onChangeBundleItems(index, key, value))}
        isOpen={modalOpen}
        index={index}
        lang={langcode}
        type="collection"
      />
    </div>
  );
};

export default CollectionURLs;
