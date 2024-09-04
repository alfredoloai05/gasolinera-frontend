import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function CrudTable({ columns, data, onEdit, onDelete, actions = [] }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.field}>{col.title}</TableCell>
            ))}
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id || row.cedula}>
              {columns.map((col) => (
                <TableCell key={col.field}>
                  {/* Verificar si el valor de la columna es un objeto */}
                  {typeof row[col.field] === "object" && row[col.field] !== null
                    ? row[col.field].nombre // Por ejemplo, acceder a la propiedad nombre si es un objeto
                    : col.field === "estado" // Si es la columna de estado
                    ? row.estado
                      ? "Disponible"
                      : "Ocupado"
                    : row[col.field]} {/* Renderizar otros valores normalmente */}
                </TableCell>
              ))}
              <TableCell>
                {/* Acciones Personalizadas */}
                {actions.map((action, index) => (
                  <Tooltip title={action.tooltip} key={index}>
                    <IconButton onClick={(event) => action.onClick(event, row)}>
                      {action.icon()}
                    </IconButton>
                  </Tooltip>
                ))}

                {/* Acciones Predeterminadas: Editar y Eliminar */}
                <Tooltip title="Editar">
                  <IconButton onClick={() => onEdit(row)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton onClick={() => onDelete(row)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CrudTable;
