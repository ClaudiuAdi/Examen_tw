import "./ArticleList.css";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { useNavigate } from "react-router-dom";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";

import {
  getArticles,
  addArticle,
  saveArticle,
  deleteArticle,
} from "../actions";

const articleSelector = (state) => state.article.articleList;
const articleCountSelector = (state) => state.article.count;

function ArticleList() {
  var today = new Date();
  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

  const navigate = useNavigate();

  const [isDialogShown, setIsDialogShown] = useState(false);
  const [titlu, setTitlu] = useState("");
  const [rezumat, setRezumat] = useState("");
  const [data, setData] = useState(date);
  const [isNewRecord, setIsNewRecord] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [filterString, setFilterString] = useState("");
  const [filters, setFilters] = useState({
    titlu: { value: null, matchMode: FilterMatchMode.CONTAINS },
    rezumat: { value: null, matchMode: FilterMatchMode.CONTAINS },
    data: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [page, setPage] = useState(0);
  const [first, setFirst] = useState(0);
  const [sortField, setSortFiels] = useState("");
  const [sortOrder, setSortOrder] = useState(1);

  const handleSort = (evt) => {
    setSortFiels(evt.sortField);
    setSortOrder(evt.sortOrder);
  };

  const handleFilter = (evt) => {
    const oldFilters = filters;
    oldFilters[evt.field] = evt.constraints.constraints[0];
    setFilters({ ...oldFilters });
  };

  const handleFilterClear = (evt) => {
    setFilters({
      titlu: { value: null, matchMode: FilterMatchMode.CONTAINS },
      rezumat: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  useEffect(() => {
    const keys = Object.keys(filters);
    const computedFilterString = keys
      .map((e) => {
        return {
          key: e,
          value: filters[e].value,
        };
      })
      .filter((e) => e.value)
      .map((e) => `${e.key}=${e.value}`)
      .join("&");
    setFilterString(computedFilterString);
  }, [filters]);

  let articles = useSelector(articleSelector);
  const count = useSelector(articleCountSelector);

  if (articles === undefined) {
    articles = [];
  }

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getArticles(filterString, page, 5, sortField, sortOrder));
  }, [filterString, page, sortField, sortOrder]);

  useEffect(() => {
    const data = [["titlu", "rezumat", "data"]];
    for (const article of articles) {
      data.push([article.titlu, article.rezumat, article.data]);
    }
  }, [articles]);

  const handleAddClick = (evt) => {
    setIsDialogShown(true);
    setIsNewRecord(true);
    setTitlu("");
    setRezumat("");
    setData(date);
  };

  const hideDialog = () => {
    setIsDialogShown(false);
  };

  const handleSaveClick = () => {
    if (isNewRecord) {
      dispatch(addArticle({ titlu, rezumat, data }));
    } else {
      dispatch(saveArticle(selectedArticle, { titlu, rezumat, data }));
    }
    setIsDialogShown(false);
    setSelectedArticle(null);
    setTitlu("");
    setRezumat("");
    setData(date);
  };

  const editArticle = (rowData) => {
    setSelectedArticle(rowData.id);
    setTitlu(rowData.titlu);
    setRezumat(rowData.rezumat);
    setData(rowData.data);
    setIsDialogShown(true);
    setIsNewRecord(false);
  };

  const navArticle = (rowData) => {
    setSelectedArticle(rowData.id);
    navigate("/articles/" + rowData.id);
    console.log("/articles/" + rowData.id);
  };

  const handleDeleteArticle = (rowData) => {
    dispatch(deleteArticle(rowData.id));
  };

  const tableFooter = (
    <div>
      <Button label="Add" icon="pi pi-plus" onClick={handleAddClick} />
    </div>
  );

  const dialogFooter = (
    <div>
      <Button label="Save" icon="pi pi-save" onClick={handleSaveClick} />
    </div>
  );

  const opsColumn = (rowData) => {
    return (
      <div>
        <Button
          label="Edit"
          icon="pi pi-pencil"
          onClick={() => editArticle(rowData)}
        />
        <Button
          label="Delete"
          icon="pi pi-times"
          className="p-button p-button-danger"
          style={{ marginLeft: "10px" }}
          onClick={() => handleDeleteArticle(rowData)}
        />
        <Button
          label="References"
          className="p-button p-button-info"
          style={{ marginLeft: "10px" }}
          onClick={() => navArticle(rowData)}
        />
      </div>
    );
  };

  const handlePageChange = (evt) => {
    setPage(evt.page);
    setFirst(evt.page * 6);
  };

  return (
    <div>
      <div class="components">
        <DataTable
          value={articles}
          footer={tableFooter}
          lazy
          paginator
          onPage={handlePageChange}
          first={first}
          rows={4}
          totalRecords={count}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
        >
          <Column
            xs={12}
            sm={3}
            md={2}
            lg={1}
            header="Titlu"
            field="titlu"
            filter
            filterField="titlu"
            filterPlaceholder="filter by titlu"
            onFilterApplyClick={handleFilter}
            onFilterClear={handleFilterClear}
            sortable
          />
          <Column
            header="Rezumat"
            field="rezumat"
            filter
            filterField="rezumat"
            filterPlaceholder="filter by rezumat"
            onFilterApplyClick={handleFilter}
            onFilterClear={handleFilterClear}
            sortable
          />
          <Column header="Data" field="data" />
          <Column header="Options" body={opsColumn} />
        </DataTable>
      </div>

      <Dialog
        header="An article"
        visible={isDialogShown}
        onHide={hideDialog}
        footer={dialogFooter}
      >
        <div>
          <InputText
            placeholder="titlu"
            onChange={(evt) => setTitlu(evt.target.value)}
            value={titlu}
          />
        </div>
        <div>
          <InputText
            placeholder="rezumat"
            onChange={(evt) => setRezumat(evt.target.value)}
            value={rezumat}
          />
        </div>
        <div>
          <InputText
            placeholder="data"
            onChange={(evt) => setData(evt.target.value)}
            value={data}
          />
        </div>
      </Dialog>
    </div>
  );
}

export default ArticleList;
