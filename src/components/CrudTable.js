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
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: "#eaf4f4",
        fontFamily: "Poppins, sans-serif",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
        borderRadius: 2,
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#4caf50" }}>
            {columns.map((col) => (
              <TableCell
                key={col.field}
                sx={{ color: "white", fontWeight: 600, fontFamily: "Poppins, sans-serif" }}
              >
                {col.title}
              </TableCell>
            ))}
            <TableCell sx={{ color: "white", fontWeight: 600, fontFamily: "Poppins, sans-serif" }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.id || row.cedula}
              sx={{
                "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" },
                "&:nth-of-type(even)": { backgroundColor: "#e0f2f1" },
              }}
            >
              {columns.map((col) => (
                <TableCell key={col.field} sx={{ fontFamily: "Poppins, sans-serif" }}>
                  {col.render
                    ? col.render(row)
                    : typeof row[col.field] === "object" && row[col.field] !== null
                      ? row[col.field].nombre
                      : col.field === "estado"
                        ? row.estado
                          ? "Disponible"
                          : "Ocupado"
                        : row[col.field]}
                </TableCell>
              ))}
              <TableCell>
                {/* Acciones Personalizadas */}
                {actions.map((action, index) => (
                  <Tooltip title={action.tooltip} key={index}>
                    <IconButton
                      onClick={(event) => action.onClick(event, row)}
                      sx={{ color: "#388e3c" }}
                    >
                      {action.icon()}
                    </IconButton>
                  </Tooltip>
                ))}

                {/* Acciones Predeterminadas: Editar y Eliminar */}
                <Tooltip title="Editar">
                  <IconButton onClick={() => onEdit(row)} sx={{ color: "#1976d2" }}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton onClick={() => onDelete(row)} sx={{ color: "#d32f2f" }}>
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
