import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';


const routes: Routes = [
    {
        path: 'mapping-area',
        loadChildren: './mapping-area/mapping-area.module#MappingAreaModule'
    },
    {
        path: 'mapping-ho',
        loadChildren: './mapping-cell-ho/mapping-cell-ho.module#MappingCellHoModule'
    },
    {
        path: 'counterpart',
        loadChildren: './counterpart/counterpart.module#CounterpartModule'
    },
];

@NgModule({
    imports: [SharedModule, RouterModule.forChild(routes)],
    declarations: []
})
export class CultureModule {
}
