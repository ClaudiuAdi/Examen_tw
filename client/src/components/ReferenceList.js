import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

import {
  getReferences,
  addReference,
  saveReference,
  deleteReference,
} from "../actions";
import useFetch from "./useFetch";

const referenceSelector = (state) => state.reference.referenceList;

const ReferenceList = () => {
  var today = new Date();
  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

  const [isDialogShown, setIsDialogShown] = useState(false);
  const [titlu, setTitlu] = useState("");
  const [data, setData] = useState(date);
  const [autori, setAutori] = useState([]);

  const [isNewRecord, setIsNewRecord] = useState(true);
  const [selectedReference, setSelectedReference] = useState(null);

  let references = useSelector(referenceSelector);

  if (references === undefined) {
    references = [];
  }

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getReferences(id));
  }, []);

  const handleAddClick = (evt) => {
    setIsDialogShown(true);
    setIsNewRecord(true);
    setTitlu("");
    setData(date);
    setAutori([]);
  };

  const hideDialog = () => {
    setIsDialogShown(false);
  };

  const handleSaveClick = () => {
    if (isNewRecord) {
      dispatch(addReference(id, { titlu, data, autori }));
    } else {
      dispatch(saveReference(id, selectedReference, { titlu, data, autori }));
    }
    setIsDialogShown(false);
    setSelectedReference(null);
    setTitlu("");
    setData(date);
    setAutori([]);
  };

  const editReference = (rowData) => {
    setSelectedReference(rowData.id);
    setTitlu(rowData.titlu);
    setData(rowData.data);
    setAutori(rowData.data);
    setIsDialogShown(true);
    setIsNewRecord(false);
  };

  const handleDeleteReference = (rowData) => {
    dispatch(deleteReference(rowData.id));
  };

  const tableFooter = (
    <div>
      <Button
        label="Add reference"
        icon="pi pi-plus"
        onClick={handleAddClick}
      />
    </div>
  );

  const dialogFooter = (
    <div>
      <Button
        label="Save reference"
        icon="pi pi-save"
        onClick={handleSaveClick}
      />
    </div>
  );

  const opsColumn = (rowData) => {
    return (
      <div>
        <Button
          label="Edit"
          icon="pi pi-pencil"
          onClick={() => editReference(rowData)}
        />
        <Button
          label="Delete"
          icon="pi pi-times"
          className="p-button p-button-danger"
          onClick={() => handleDeleteReference(rowData)}
        />
      </div>
    );
  };

  const { id } = useParams();
  const {
    data: article,
    error,
    isPending,
  } = useFetch(`http://localhost:8080/articles/${id}`);

  console.log("reference received article id" + id);
  const navigate = useNavigate();
  return (
    <>
      <div>
        {isPending && <div> Loading...</div>}
        {error && <div>{error}</div>}
        {article && (
          <article>
            <h2>Article: {article.titlu}</h2>
          </article>
        )}
      </div>
      <DataTable value={references} footer={tableFooter}>
        <Column header="Titlu" field="titlu" />
        <Column header="Data" field="data" />
        <Column header="Autori" field="autori" />
        <Column header="Options" body={opsColumn} />
      </DataTable>

      <Dialog
        header="A New Reference"
        visible={isDialogShown}
        onHide={hideDialog}
        footer={dialogFooter}
      >
        <div>
          <InputText
            placeholder="Reference titlu"
            onChange={(evt) => setTitlu(evt.target.value)}
            value={titlu}
          />
        </div>
        <div>
          <InputText
            placeholder="Reference data"
            onChange={(evt) => setData(evt.target.value)}
            value={data}
          />
        </div>
        <div>
          <InputText
            placeholder="Reference autori"
            onChange={(evt) => setAutori(evt.target.value)}
            value={autori}
          />
        </div>
      </Dialog>

      <Button label="Back" onClick={() => navigate(-1)} />
    </>
  );
};

export default ReferenceList;
