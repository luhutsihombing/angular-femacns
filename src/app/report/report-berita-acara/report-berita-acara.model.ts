export interface ReportBeritaAcaraSearchTerm {
    category?: string;
    counterPart?: string;
    cell?: string;
    startDate?: string;
    endDate?: string;
}

export interface ReportBeritaAcara {
    id: string;
    kategoriKegiatan: string;
    catatanKegiatan: string;
    cell: string;
    jenisKegiatan: string;
    jumlahPeserta: string;
    namaCounterPart: string;
    namaNotulen: string;
    namaPembinaUtama: string;
    pelaksanaKegiatan: string;
    target: string;
    tempatPelaksanaanKegiatan: string;
    tglPelaksananKegiatan: string;
    timelineEnd: string;
    timelineStart: string;
    bh: string;
    mh: string;
    other: string;
    parenting_Head: string;
    rh: string;
    sh_CR1: string;
    sh_CR2: string;
    sh_Credit: string;
    sh_Support: string;
}

export interface CellArea {
    code: string;
    name: string;
    enabled: boolean;
    checked: boolean;
}

export interface Cell {
    code: string;
    name: string;
    enabled: boolean;
    checked: boolean;
    cell: CellArea[];
}
